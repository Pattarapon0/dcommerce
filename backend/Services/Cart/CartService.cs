using backend.Data.Cart;
using backend.Data.Cart.Entities;
using backend.Data.Products;
using backend.DTO.Cart;
using backend.Common.Results;
using backend.Common.Config;
using Microsoft.Extensions.Options;
using LanguageExt;
using static LanguageExt.Prelude;
using LanguageExt.Effects;
using backend.Services.Products;
using System.Data;
using Microsoft.VisualBasic;
using backend.Data.Products.Entities;
using backend.DTO.Products;
using Microsoft.AspNetCore.Mvc;

namespace backend.Services.Cart;

public class CartService(
    ICartRepository cartRepository,
    IProductService productService,
    IOptions<CartLimits> cartLimits) : ICartService
{
    private readonly ICartRepository _cartRepository = cartRepository;
    private readonly IProductService _productService = productService;
    private readonly CartLimits _cartLimits = cartLimits.Value;

    public Task<Fin<CartItemDto>> AddToCartAsync(AddToCartRequest request, Guid userId)
    {
        return FinT<IO, bool>.Lift(
            liftIO(() => _productService.HasSufficientStockAsync(request.ProductId, request.Quantity))
        )
        .Bind<Unit>(hasStock =>
            hasStock
                ? Unit.Default
                : ServiceError.BadRequest("Insufficient stock for product")
        )
        .Bind<Unit>(_ =>
            liftIO(() => ValidateCartLimits(userId, request.Quantity))
        )
        .Bind<CartItem>(_ =>
            liftIO(() => _cartRepository.AddItemAsync(new CartItem
            {
                UserId = userId,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
            }))
        )
        .Map(cartItem => new CartItemDto
        {
            Id = cartItem.Id,
            ProductId = cartItem.ProductId,
            SellerId = cartItem.Product?.SellerId ?? Guid.Empty,
            Quantity = cartItem.Quantity,
            AvailableStock = cartItem.Product?.Stock ?? 0,
            IsInStock = (cartItem.Product?.IsActive ?? false) && (cartItem.Product?.Stock ?? 0) >= cartItem.Quantity,
            TotalPrice = cartItem.Quantity * (cartItem.Product?.Price ?? 0)
        }).Run().Run().AsTask();
    }


    public async Task<Fin<CartSummaryDto>> GetUserCartAsync(Guid userId)
    {
        var cartItemsResult = await _cartRepository.GetUserCartAsync(userId);
        return cartItemsResult.Map(MapToCartSummary);
    }

    public async Task<Fin<CartItemDto>> GetCartItemAsync(Guid cartItemId, Guid userId)
    {
        var cartItemResult = await _cartRepository.GetCartItemByIdAsync(cartItemId, userId);
        return cartItemResult.Map(MapToCartItemDto);
    }

    public Task<Fin<CartItemDto>> UpdateCartItemAsync(Guid cartItemId, UpdateCartItemRequest request, Guid userId)
    {

        FinT<IO, CartItem> va = liftIO(() => _cartRepository.GetCartItemByIdAsync(cartItemId, userId));

        return va.Bind<CartItem>(cartItem =>
           {
               return cartItem.Product.Stock > request.Quantity
                    ? cartItem
                    : ServiceError.BadRequest("Insufficient stock for product");
           })
           .Bind<CartItem>(cartItem =>
           {
               return liftIO(() => ValidateCartLimits(userId, request.Quantity))
                   .Map(_ => cartItem);
           }).Bind<CartItem>(cartItem =>
           {
               cartItem.Quantity = request.Quantity;
               return liftIO(() => _cartRepository.UpdateCartItemAsync(cartItem)).Map(_ => cartItem);
           }).Map(cartItem => MapToCartItemDto(cartItem)).Run().Run().AsTask();
    }

    public Task<Fin<Unit>> RemoveCartItemAsync(Guid cartItemId, Guid userId)
    {
        return FinT<IO, bool>.Lift(liftIO(() => _cartRepository.IsCartItemOwnedByUserAsync(cartItemId, userId)))
             .Bind<Unit>(isOwned =>
                     isOwned
                         ? Unit.Default
                         : ServiceError.Forbidden("You do not own this cart item")
             ).Bind<Unit>(_ =>
                 liftIO(() => _cartRepository.RemoveCartItemAsync(cartItemId))
             ).Run().Run().AsTask();

    }

    public async Task<Fin<Unit>> RemoveCartItemByProductAsync(Guid productId, Guid userId)
    {
        return await _cartRepository.RemoveCartItemByProductAsync(userId, productId);
    }

    public async Task<Fin<Unit>> ClearCartAsync(Guid userId)
    {
        return await _cartRepository.ClearUserCartAsync(userId);
    }

    public async Task<Fin<Unit>> MergeGuestCartAsync(List<AddToCartRequest> guestCartItems, Guid userId)
    {
        foreach (var item in guestCartItems)
        {
            var result = await AddToCartAsync(item, userId);
            if (result.IsFail)
                continue; // Skip invalid items
        }
        return FinSucc(Unit.Default);
    }

    public Task<Fin<CartSummaryDto>> GetCartCheckoutSummaryAsync(Guid userId)
    {
        // Validate cart and return only valid items
        return FinT<IO, List<CartItem>>.Lift(
            liftIO(() => _cartRepository.GetCartItemsWithStockCheckAsync(userId))
        ).Map(MapToCartSummary).Run().Run().AsTask();
    }



    private async Task<Fin<Unit>> ValidateCartLimits(Guid userId, int newQuantity)
    {
        // Check max quantity per item
        if (newQuantity > _cartLimits.MaxQuantityPerItem)
        {
            return FinFail<Unit>(ServiceError.BadRequest($"Maximum quantity per item is {_cartLimits.MaxQuantityPerItem}"));
        }

        // Get all cart limits info in a single query
        var limitsInfoResult = await _cartRepository.GetCartLimitsInfoAsync(userId);
        if (limitsInfoResult.IsFail) return FinSucc(Unit.Default); // Allow if can't check (new cart)

        var limitsInfo = limitsInfoResult.Match(
            info => info,
            error => new CartLimitsInfo
            {
                TotalItemCount = 0,
                UniqueProductCount = 0,
                TotalValue = 0
            }
        );

        // Check max unique products
        if (limitsInfo.UniqueProductCount >= _cartLimits.MaxUniqueProductsPerCart)
        {
            return FinFail<Unit>(ServiceError.BadRequest($"Maximum {_cartLimits.MaxUniqueProductsPerCart} different products allowed in cart"));
        }

        // Check max total items
        if (limitsInfo.TotalItemCount + newQuantity > _cartLimits.MaxItemsPerCart)
        {
            return FinFail<Unit>(ServiceError.BadRequest($"Maximum {_cartLimits.MaxItemsPerCart} total items allowed in cart"));
        }

        // Check max cart value
        if (limitsInfo.TotalValue > _cartLimits.MaxCartValue)
        {
            return FinFail<Unit>(ServiceError.BadRequest($"Maximum cart value is ${_cartLimits.MaxCartValue:F2}"));
        }

        return FinSucc(Unit.Default);
    }

    private static CartItemDto MapToCartItemDto(CartItem cartItem)
    {
        return new CartItemDto
        {
            Id = cartItem.Id,
            ProductId = cartItem.ProductId,
            SellerId = cartItem.Product?.SellerId ?? Guid.Empty,
            Quantity = cartItem.Quantity,
            AvailableStock = cartItem.Product?.Stock ?? 0,
            IsInStock = (cartItem.Product?.IsActive ?? false) && (cartItem.Product?.Stock ?? 0) >= cartItem.Quantity,
            TotalPrice = cartItem.Quantity * (cartItem.Product?.Price ?? 0),
            Currency = "THB",

            // Minimal product info needed for cart functionality
            ProductName = cartItem.Product?.Name ?? string.Empty,
            ProductPrice = cartItem.Product?.Price ?? 0,
            ProductImageUrl = cartItem.Product?.Images?.FirstOrDefault(),

            // Minimal seller info needed for cart grouping
            SellerName = cartItem.Product?.Seller?.SellerProfile?.BusinessName ?? string.Empty
        };
    }

    private static CartSummaryDto MapToCartSummary(List<CartItem> cartItems)
    {
        var cartItemDtos = cartItems.Select(MapToCartItemDto).ToList();
        var itemsBySeller = cartItems
            .GroupBy(item => item.Product?.SellerId ?? Guid.Empty)
            .ToDictionary(
                group => group.Key,
                group => new SellerCartGroupDto
                {
                    SellerId = group.Key,
                    SellerName = group.First().Product?.Seller?.SellerProfile?.BusinessName ?? "Unknown Seller",
                    Items = group.Select(MapToCartItemDto).ToList(),
                    SellerTotal = group.Sum(item => item.Quantity * (item.Product?.Price ?? 0)),
                    Currency = "THB"
                }
            );

        // Calculate validation info
        var validItems = cartItemDtos.Where(item => item.IsInStock).ToList();
        var invalidItems = cartItemDtos.Where(item => !item.IsInStock).ToList();
        var warnings = new List<string>();

        foreach (var invalidItem in invalidItems)
        {
            // Find the original cart item to get product name
            var originalItem = cartItems.FirstOrDefault(ci => ci.Id == invalidItem.Id);
            var productName = originalItem?.Product?.Name ?? "Unknown Product";

            if (invalidItem.AvailableStock == 0)
                warnings.Add($"{productName} is out of stock");
            else if (invalidItem.AvailableStock < invalidItem.Quantity)
                warnings.Add($"{productName}: only {invalidItem.AvailableStock} available (you have {invalidItem.Quantity})");
        }

        return new CartSummaryDto
        {
            Items = cartItemDtos,
            TotalItems = cartItemDtos.Sum(item => item.Quantity),
            TotalAmount = validItems.Sum(item => item.TotalPrice), // Only count valid items in total
            Currency = "THB",
            ItemsBySeller = itemsBySeller,
            HasInvalidItems = invalidItems.Count != 0,
            ValidationWarnings = warnings,
            LastUpdated = DateTime.UtcNow,
            ValidItemCount = validItems.Count,
            InvalidItemCount = invalidItems.Count
        };
    }
}