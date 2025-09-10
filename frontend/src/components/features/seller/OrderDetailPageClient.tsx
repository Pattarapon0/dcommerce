"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Package, MapPin, AlertCircle, Truck} from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import { useGetOrder } from '@/hooks/useOrder';
import { useUpdateOrderItemStatus, useCancelOrderItem } from '@/hooks/useOrderMutations';
import type { OrderDto, OrderItemDto, OrderItemStatus } from '@/lib/api/orders';
import { useParams } from 'next/navigation';

export default function OrderDetailPageClient() {
  const { id: orderId } = useParams<{ id: string }>();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Use existing hooks instead of direct React Query
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch
  } = useGetOrder(orderId);

  // Use existing mutation hooks
  const updateStatusMutation = useUpdateOrderItemStatus();
  const cancelItemMutation = useCancelOrderItem();

  // Handler functions using existing hooks
  const handleUpdateStatus = (orderItemId: string, status: string) => {
    updateStatusMutation.mutate({ 
      orderItemId, 
      request: { Status: status as OrderItemStatus } 
    });
  };

  const handleCancelItem = (orderItemId: string) => {
    if (confirm('Are you sure you want to cancel this item?')) {
      cancelItemMutation.mutate(orderItemId);
    }
  };

  const handleBulkShip = () => {
    const selectedOrderItems = order?.OrderItems?.filter((item: OrderItemDto) => 
      selectedItems.includes(item.Id!)
    );
    
    selectedOrderItems?.forEach((item: OrderItemDto) => {
      if (item.Status === 'Pending') {
        handleUpdateStatus(item.Id!, 'Processing');
      } else if (item.Status === 'Processing') {
        handleUpdateStatus(item.Id!, 'Shipped');
      }
    });
    
    setSelectedItems([]);
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getOrderStatus = (order: OrderDto): string => {
    if (!order.OrderItems || order.OrderItems.length === 0) return 'Processing';
    
    const statuses = order.OrderItems.map(item => item.Status);
    
    if (statuses.every(status => status === 'Delivered')) return 'Delivered';
    if (statuses.every(status => status === 'Cancelled')) return 'Cancelled'; 
    if (statuses.some(status => status === 'Shipped')) return 'Shipped';
    if (statuses.some(status => status === 'Processing')) return 'Processing';
    
    return 'Processing';
  };

  const hasActionableItems = order?.OrderItems?.some((item: OrderItemDto) => 
    item.Status === 'Pending' || item.Status === 'Processing'
  );
  const selectedActionableItems = selectedItems.filter(itemId => {
    const item = order?.OrderItems?.find((item: OrderItemDto) => item.Id === itemId);
    return item?.Status === 'Pending' || item?.Status === 'Processing';
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading order details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !order) {
    return (
      <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load order
            </h2>
            <p className="text-gray-600 mb-4">
              {(error instanceof Error)? error.message : 'The order could not be found or you do not have permission to view it.'}
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => router.back()} variant="outline">
                Go Back
              </Button>
              <Button onClick={() => refetch()}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 via-white to-slate-50/50 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 lg:p-6">
        {/* Simple Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4 -ml-2 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Order #{order.OrderNumber}
              </h1>
              <div className="flex items-center gap-4 text-gray-600">
                <span>Customer: {order.BuyerName}</span>
                <span>•</span>
                <span>{formatDate(order.CreatedAt || '')}</span>
                <span>•</span>
                <span className="font-semibold text-gray-900">{formatCurrency(order.SubTotal || 0, 'THB')} + {formatCurrency(order.Tax || 0, 'THB')} tax</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={getOrderStatus(order)} />
              {hasActionableItems && (
                <Button 
                  onClick={() => {
                    const actionableItems = order.OrderItems?.filter((item: OrderItemDto) => 
                      item.Status === 'Pending' || item.Status === 'Processing'
                    );
                    actionableItems?.forEach((item: OrderItemDto) => {
                      if (item.Status === 'Pending') {
                        handleUpdateStatus(item.Id!, 'Processing');
                      } else if (item.Status === 'Processing') {
                        handleUpdateStatus(item.Id!, 'Shipped');
                      }
                    });
                  }}
                  disabled={updateStatusMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Truck className="h-4 w-4 mr-2" />
                  {updateStatusMutation.isPending ? 'Processing...' : 'Process All Items'}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Order Items ({order.OrderItems?.length || 0})</h2>
                <div className="flex items-center gap-3">
                  {hasActionableItems && selectedActionableItems.length === 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const actionableItemIds = order.OrderItems
                          ?.filter((item: OrderItemDto) => item.Status === 'Pending' || item.Status === 'Processing')
                          .map((item: OrderItemDto) => item.Id!) || [];
                        setSelectedItems(actionableItemIds);
                      }}
                    >
                      Select All Actionable
                    </Button>
                  )}
                  {hasActionableItems && selectedActionableItems.length > 0 && (
                    <>
                      <span className="text-sm text-gray-600">
                        {selectedActionableItems.length} selected
                      </span>
                      <Button 
                        onClick={handleBulkShip}
                        size="sm"
                        disabled={updateStatusMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {updateStatusMutation.isPending ? 'Processing...' : 'Process Selected'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {order.OrderItems?.map((item: OrderItemDto) => (
                  <div key={item.Id} className="border rounded-lg p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="relative w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                          {item.ProductImageUrl ? (
                            <Image
                              src={item.ProductImageUrl}
                              alt={item.ProductName || "Product"}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selection Checkbox - for items that can be acted upon */}
                      {(item.Status === 'Pending' || item.Status === 'Processing') && (
                        <div className="flex items-center pt-2">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.Id!)}
                            onChange={() => toggleItemSelection(item.Id!)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 mb-1">{item.ProductName}</h3>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>Quantity: {item.Quantity}</div>
                          <div>Price: {formatCurrency(item.PriceAtOrderTime || 0, 'THB')} each</div>
                          <div className="font-medium text-gray-900">
                            Subtotal: {formatCurrency((item.Quantity! * item.PriceAtOrderTime!) || 0, 'THB')}
                          </div>
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col items-end gap-3">
                        <StatusBadge status={item.Status!} />
                        
                         {(item.Status === 'Pending' || item.Status === 'Processing') && (
                           <div className="flex gap-2">
                             {item.Status === 'Pending' && (
                               <Button 
                                 size="sm"
                                 onClick={() => handleUpdateStatus(item.Id!, 'Processing')}
                                 disabled={updateStatusMutation.isPending}
                                 className="bg-blue-600 hover:bg-blue-700"
                               >
                                 <Package className="h-4 w-4 mr-2" />
                                 Confirm Order
                               </Button>
                             )}
                             {item.Status === 'Processing' && (
                               <Button 
                                 size="sm"
                                 onClick={() => handleUpdateStatus(item.Id!, 'Shipped')}
                                 disabled={updateStatusMutation.isPending}
                                 className="bg-green-600 hover:bg-green-700"
                               >
                                 <Truck className="h-4 w-4 mr-2" />
                                 Ship Now
                               </Button>
                             )}
                             <Button 
                               size="sm" 
                               variant="outline"
                               onClick={() => handleCancelItem(item.Id!)}
                               disabled={cancelItemMutation.isPending}
                               className="text-red-600 border-red-200 hover:bg-red-50"
                             >
                               Cancel Item
                             </Button>
                           </div>
                         )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600 block">Customer:</span>
                  <span className="font-medium">{order.BuyerName}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Address:</span>
                  <span className="font-medium">{order.ShippingAddressSnapshot}</span>
                </div>
                <div>
                  <span className="text-gray-600 block">Order Date:</span>
                  <span className="font-medium">{formatDate(order.CreatedAt || '')}</span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{order.OrderItems?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-amber-600">
                    {order.OrderItems?.filter((item: OrderItemDto) => item.Status === 'Pending').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing:</span>
                  <span className="font-medium text-blue-600">
                    {order.OrderItems?.filter((item: OrderItemDto) => item.Status === 'Processing').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipped:</span>
                  <span className="font-medium text-green-600">
                    {order.OrderItems?.filter((item: OrderItemDto) => item.Status === 'Shipped').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivered:</span>
                  <span className="font-medium text-emerald-600">
                    {order.OrderItems?.filter((item: OrderItemDto) => item.Status === 'Delivered').length || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancelled:</span>
                  <span className="font-medium text-red-600">
                    {order.OrderItems?.filter((item: OrderItemDto) => item.Status === 'Cancelled').length || 0}
                  </span>
                </div>
                <hr className="border-gray-200" />
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(order.SubTotal || 0, 'THB')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax:</span>
                  <span className="font-medium">{formatCurrency(order.Tax || 0, 'THB')}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                  <span>Order Total:</span>
                  <span>{formatCurrency(order.Total || 0, 'THB')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}