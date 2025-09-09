"use client";

import { RotateCcw, X } from 'lucide-react';
import { formatDate } from '@/lib/utils/date';
import { hasReorderableItems, getReorderableItemsCount } from '@/hooks/useOrderUtils';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';
import type { OrderDto } from '@/lib/api/orders';

interface OrderHeaderProps {
  order: OrderDto;
  onReorder: () => void;
  onCancel: () => void;
  canCancel: boolean;
  isReordering?: boolean;
  isCancelling?: boolean;
}

export default function OrderHeader({ 
  order, 
  onReorder, 
  onCancel, 
  canCancel,
  isReordering = false,
  isCancelling = false
}: OrderHeaderProps) {
  const canReorder = hasReorderableItems(order);
  const reorderableCount = getReorderableItemsCount(order);
  const totalItems = order.OrderItems?.length || 0;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            Order #{order.OrderNumber}
          </h1>
          <p className="text-gray-600">
            Placed {formatDate(order.CreatedAt!)} • {totalItems} items
            {reorderableCount < totalItems && (
              <span className="text-amber-600 ml-1">
                ({reorderableCount} available for reorder)
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-row gap-3">
          <button
            onClick={onReorder}
            disabled={isReordering || !canReorder}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title={!canReorder ? 'No items available for reorder' : undefined}
          >
            <RotateCcw className="h-4 w-4" />
            {isReordering ? 'Adding to Cart...' : canReorder ? `Reorder ${reorderableCount > 1 ? `(${reorderableCount} items)` : ''}` : 'No Items Available'}
          </button>
          
          {canCancel && (
            <ConfirmationDialog
              trigger={
                <button
                  disabled={isCancelling}
                  className="flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X className="h-4 w-4" />
                  {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              }
              title={`Cancel order #${order.OrderNumber || 'Unknown'}`}
              description="Are you sure you want to cancel this order? This action cannot be undone."
              confirmText="Cancel Order"
              confirmVariant="destructive"
              onConfirm={onCancel}
              isLoading={isCancelling}
            />
          )}
        </div>
      </div>
    </div>
  );
}