"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Eye, RotateCcw, X, MapPin } from 'lucide-react';
import { type OrderDto, type OrderItemDto } from '@/lib/api/orders';
import { useCancelOrder, useReorderItems } from '@/hooks/useOrderMutations';
import { hasReorderableItems, getReorderableItemsCount } from '@/hooks/useOrderUtils';
import { useFormatUserPrice } from '@/hooks/useUserCurrency';
import { formatDate } from '@/lib/utils/date';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

interface OrderCardProps {
  order: OrderDto;
}

type OrderItemStatus = "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";

interface StatusBadgeProps {
  status: OrderItemStatus;
  size?: 'small' | 'normal';
}

const getStatusColor = (status: OrderItemStatus): string => {
  switch (status) {
    case "Pending":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Processing":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Shipped":
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "Delivered":
      return "bg-green-100 text-green-800 border-green-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getStatusIcon = (status: OrderItemStatus): string => {
  switch (status) {
    case "Pending":
      return "🕒";
    case "Processing":
      return "⚙️";
    case "Shipped":
      return "🚚";
    case "Delivered":
      return "✅";
    case "Cancelled":
      return "❌";
    default:
      return "❓";
  }
};

const StatusBadge = ({ status, size = 'normal' }: StatusBadgeProps) => {
  const colorClass = getStatusColor(status);
  const icon = getStatusIcon(status);

  return (
    <span className={`
      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
      ${colorClass}
      ${size === 'small' ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1'}
    `}>
      <span className={size === 'small' ? 'text-xs' : 'text-sm'}>{icon}</span>
      {status}
    </span>
  );
};

const OrderItemPreview = ({ item }: { item: OrderItemDto }) => {
  const formatUserPrice = useFormatUserPrice();
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={item.ProductImageUrl || ''}
          alt={item.ProductName || ''}
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 truncate">{item.ProductName}</h4>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Qty: {item.Quantity}</span>
          <span>•</span>
          <span>{formatUserPrice(item.LineTotal ?? 0)}</span>
        </div>
      </div>
      <StatusBadge status={item.Status as OrderItemStatus} size="small" />
    </div>
  );
};

export default function OrderCard({ order }: OrderCardProps) {
  const [showAllItems, setShowAllItems] = useState(false);
  const router = useRouter();
  const formatUserPrice = useFormatUserPrice();
  
  // Real mutations
  const cancelMutation = useCancelOrder();
  const reorderMutation = useReorderItems();

  // Check reorder availability
  const canReorder = hasReorderableItems(order);
  const reorderableCount = getReorderableItemsCount(order);
  const totalItems = order.OrderItems?.length || 0;

  // Remove order-level status calculation
  const canCancel = (order?.OrderItems ?? []).some(item =>
    item.Status === "Pending" || item.Status === "Processing"
  );

  const handleViewDetails = () => {
    if (order.Id) {
      router.push(`/orders/${order.Id}`);
    }
  };

  const handleCancel = () => {
    if (order.Id) {
      cancelMutation.mutate(order.Id);
    }
  };

  const handleReorder = () => {
    if (order.OrderItems && canReorder) {
      reorderMutation.mutate(order.OrderItems);
    }
  };

  // Show first 2 items by default, or all if user clicks "show more"
  const itemsToShow = showAllItems
    ? (order?.OrderItems ?? [])
    : (order?.OrderItems ?? []).slice(0, 2);
  const hasMoreItems = (order?.OrderItems?.length ?? 0) > 2;
  const remainingItemsCount = (order?.OrderItems?.length ?? 0) - 2;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-gray-300 bg-gradient-to-br from-white to-gray-50/30">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">#{order.OrderNumber}</h3>
          <p className="text-sm text-gray-600">{formatDate(order.CreatedAt || '')}</p>
          {reorderableCount < totalItems && reorderableCount > 0 && (
            <p className="text-xs text-amber-600 mt-1">
              {reorderableCount} of {totalItems} items available for reorder
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{formatUserPrice(order.Total || 0)}</p>
        </div>
      </div>

      {/* Items Preview Section */}
      <div className="space-y-3 mb-4">
        {itemsToShow.map((item) => (
          <OrderItemPreview
            key={item.Id}
            item={item}
          />
        ))}

        {/* Show more/less toggle */}
        {hasMoreItems && (
          <button
            onClick={() => setShowAllItems(!showAllItems)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {showAllItems
              ? 'Show less'
              : `+${remainingItemsCount} more item${remainingItemsCount > 1 ? 's' : ''}`
            }
          </button>
        )}
      </div>

      {/* Shipping Address */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-gray-700">Shipping to:</p>
            <p className="text-sm text-gray-600">{order.ShippingAddressSnapshot}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-row  gap-2">
        <button 
          onClick={handleViewDetails}
          className="w-[130px] bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-2 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
        >
          <Eye className="h-4 w-4" />
          View Details
        </button>

        <div className="flex flex-row gap-2 sm:ml-auto">
          {canCancel && (
            <ConfirmationDialog
              trigger={
                <button
                  disabled={cancelMutation.isPending}
                  className="w-full sm:w-[70px] px-2 py-2 border border-red-200 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 hover:border-red-300 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1 shadow-sm hover:shadow disabled:opacity-50"
                >
                  <X className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                  </span>
                  <span className="sm:hidden">
                    {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                  </span>
                </button>
              }
              title={`Cancel order #${order.OrderNumber}`}
              description="Are you sure you want to cancel this order? This action cannot be undone."
              confirmText="Cancel Order"
              confirmVariant="destructive"
              onConfirm={handleCancel}
              isLoading={cancelMutation.isPending}
            />
          )}

          {canReorder && (<button
            onClick={handleReorder}
            disabled={reorderMutation.isPending}
            className="w-full sm:w-[80px] px-2 py-2 border border-gray-200 text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-all duration-200 text-sm font-medium flex items-center justify-center gap-1 shadow-sm hover:shadow disabled:opacity-50"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">
              {reorderMutation.isPending ? 'Adding...' : canReorder ? 'Reorder' : 'No Items'}
            </span>
            <span className="sm:hidden">
              {reorderMutation.isPending ? 'Adding...' : canReorder ? 'Reorder' : 'No Items'}
            </span>
          </button>)}
        </div>
      </div>
    </div>
  );
}