"use client";


import { CartSummaryDto } from '@/stores/cart';
import { userAddressDto } from "@/stores/address";

interface CheckoutFormProps {
  cart: CartSummaryDto | undefined;
  userAddress?: userAddressDto;
  phoneNumber?: string;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  total: number;
  isValidatingCart: boolean;
  setIsValidatingCart: (value: boolean) => void;
}

export default function CheckoutForm({ 
  userAddress, 
  phoneNumber,
  onPlaceOrder, 
  isValidatingCart,
  setIsValidatingCart
}: CheckoutFormProps) {

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final cart validation before placing order
    setIsValidatingCart(true);
    
    // Mock validation - in real app this would call your cart validation API
    await new Promise(resolve => setTimeout(resolve, 500));
    setIsValidatingCart(false);

    // If validation passes, place order
    onPlaceOrder();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Shipping Address and Payment Method - Responsive layout */}
      <div className="flex flex-col gap-4">
        {/* Shipping Address Display */}
        <section className="bg-white rounded-xl border p-4 space-y-3 ">
          <h2 className="text-lg font-semibold">SHIPPING ADDRESS</h2>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="md:col-span-2">
                <p className="font-medium">{userAddress?.AddressLine1}</p>
              </div>
              {userAddress?.AddressLine2 && (
                <div className="md:col-span-2">
                  <p>{userAddress.AddressLine2}</p>
                </div>
              )}
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-wide">City</p>
                <p>{userAddress?.City}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-wide">State & Postal</p>
                <p>{userAddress?.State} {userAddress?.PostalCode}</p>
              </div>
              <div>
                <p className="text-gray-600 text-xs uppercase tracking-wide">Country</p>
                <p>{userAddress?.Country}</p>
              </div>
              {phoneNumber && (
                <div>
                  <p className="text-gray-600 text-xs uppercase tracking-wide">Phone</p>
                  <p>{phoneNumber}</p>
                </div>
              )}
            </div>
            <button 
              type="button"
              onClick={() => window.location.href = '/profile'}
              className="text-blue-600 hover:text-blue-700 underline text-sm mt-2"
            >
              Edit Address
            </button>
          </div>
        </section>

        {/* Payment Method */}
        <section className="bg-white rounded-xl border p-4 space-y-2 my-auto row-start-2">
          <h2 className="text-lg font-semibold">PAYMENT METHOD</h2>
          
          <div className="flex items-center space-x-3 py-2">
            <div className="w-4 h-4 bg-green-600 rounded-full flex items-center justify-center ">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <div>
              <p className="font-medium text-sm">Cash on Delivery</p>
              <p className="text-xs text-gray-600">Pay when you receive</p>
            </div>
          </div>
        </section>
      </div>

      {/* Cart Validation Status */}
      {isValidatingCart && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
            <p className="text-blue-700">Validating cart items and stock availability...</p>
          </div>
        </div>
      )}
    </form>
  );
}