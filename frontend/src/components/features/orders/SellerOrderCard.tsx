"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Package, Truck, CheckCircle, XCircle ,ChevronDown, ChevronUp , type LucideIcon} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { type OrderDto, type OrderItemStatus } from '@/lib/api/orders';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';

interface SellerOrderCardProps {
  order: OrderDto;
  onUpdateOrderStatus?: (orderItemIds: string[], status: OrderItemStatus) => void;
  onCancelOrder?: (orderItemIds: string[]) => void;
}

export default function SellerOrderCard({ 
  order, 
  onUpdateOrderStatus,
  onCancelOrder 
}: SellerOrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  // Status transition mapping (same as OrdersTable)
  const getNextStatusAction = (currentStatus: string) => {
    const statusMap: Record<string, { nextStatus: string; buttonText: string; icon: LucideIcon; variant: "default" | "outline" | "secondary" } | null> = {
      'Pending': { 
        nextStatus: 'Processing', 
        buttonText: 'Mark as Processing', 
        icon: Package,
        variant: 'default'
      },
      'Processing': { 
        nextStatus: 'Shipped', 
        buttonText: 'Mark as Shipped', 
        icon: Truck,
        variant: 'default'
      },
      'Shipped': { 
        nextStatus: 'Delivered', 
        buttonText: 'Mark as Delivered', 
        icon: CheckCircle,
        variant: 'default'
      },
      'Delivered': null,
      'Cancelled': null,
      'Closed': null
    };
    return statusMap[currentStatus] || null;
  };

  // Check if all items have same status and can be batch updated (same as OrdersTable)
  const canBatchUpdateStatus = (order: OrderDto) => {
    if (!order.OrderItems || order.OrderItems.length === 0) return null;
    
    const relevantItems = order.OrderItems;
    const statuses = [...new Set(relevantItems.map(item => item.Status))];
    
    // Must have exactly one status across all items
    if (statuses.length !== 1) return null;
    
    const currentStatus = statuses[0];
    
    // Skip if cancelled or delivered (terminal states)
    if (currentStatus === 'Cancelled' || currentStatus === 'Delivered') return null;
    
    const nextAction = currentStatus ? getNextStatusAction(currentStatus) : null;
    if (!nextAction) return null;
    
    return {
      currentStatus,
      nextStatus: nextAction.nextStatus,
      actionText: `Mark All as ${nextAction.nextStatus}`,
      icon: nextAction.icon,
      itemCount: relevantItems.length
    };
  };

  // Check if any items can be cancelled (same as OrdersTable)
  const canBatchCancel = (order: OrderDto) => {
    if (!order.OrderItems || order.OrderItems.length === 0) return false;
    
    const relevantItems = order.OrderItems;
    
    // Can cancel if all items are Pending or Processing
    return relevantItems.every(item => 
      item.Status === 'Pending' || item.Status === 'Processing'
    );
  };

  // Get order status with same priority logic as OrdersTable
  const getOrderStatus = (order: OrderDto): string => {
    if (!order.OrderItems || order.OrderItems.length === 0) return 'Pending';
    
    const statuses = order.OrderItems.map(item => item.Status);
    const uniqueStatuses = [...new Set(statuses)];
    
    // Single status - return as-is
    if (uniqueStatuses.length === 1) return uniqueStatuses[0] ?? 'Pending';
    
    // Multiple statuses - prioritize by action needed (seller workflow)
    if (statuses.some(s => s === 'Pending')) return 'Pending';       // Most urgent - needs confirmation
    if (statuses.some(s => s === 'Processing')) return 'Processing'; // Next urgent - needs fulfillment  
    if (statuses.some(s => s === 'Shipped')) return 'Shipped';       // In progress - in transit
    
    // Only Delivered + Cancelled left (all resolved states)
    return 'Closed'; // All resolved, no seller action needed
  };

  // Handle batch order status update (same logic as OrdersTable)
  const handleOrderStatusUpdate = async (order: OrderDto) => {
    const batchUpdate = canBatchUpdateStatus(order);
    
    if (!batchUpdate || !order.Id) return;

    try {
      // Update all items with the same status to next status
      const itemsToUpdate = order.OrderItems?.filter(item => 
        item.Status === batchUpdate.currentStatus
      ) || [];

      onUpdateOrderStatus?.(itemsToUpdate.map(i => i.Id!), batchUpdate.nextStatus as OrderItemStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Handle batch cancel order (same logic as OrdersTable)
 const handleOrderCancel = (order: OrderDto) => {
     if (!order.Id) return;
     
     try {
       onCancelOrder?.(order.OrderItems?.map(i => i.Id!) || []);
     } catch (error) {
       console.error('Error cancelling order:', error);
     }
   };
 

  const handleViewOrder = () => {
    router.push(`/seller/orders/${order.Id}`);
  };

  // Get the batch update info
  const batchUpdate = canBatchUpdateStatus(order);
  const canCancel = canBatchCancel(order);

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      {/* Header with order info and status */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <p className="font-semibold text-sm">#{order.OrderNumber}</p>
          <p className="text-xs text-muted-foreground">
            {order.OrderItems?.length || 0} items • {formatDate(order.CreatedAt || '')}
          </p>
          <p className="text-sm font-medium mt-1">{formatCurrency(order.Total || 0, 'THB')}</p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <StatusBadge status={getOrderStatus(order)} />
        </div>
      </div>
      
      {/* Primary Action - Full Width View Details Button */}
      <button 
        onClick={handleViewOrder}
        className="w-full px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring mb-3"
      >
        View Order Details
      </button>
      
      {/* Secondary Actions - Status Updates */}
      {(batchUpdate || canCancel) && (
        <div className="flex gap-2 mb-3">
          {/* Smart batch status update button */}
          {batchUpdate && (
            <button 
              onClick={() => handleOrderStatusUpdate(order)}
              className="flex-1 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg text-sm hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center gap-1"
            >
              <batchUpdate.icon className="h-3 w-3" />
              {batchUpdate.actionText}
            </button>
          )}
          
          {/* Smart batch cancel button */}
          {canCancel && !batchUpdate && (
            <button 
              onClick={() => handleOrderCancel(order)}
              className="flex-1 px-3 py-2 border border-red-600 text-red-600 rounded-lg text-sm hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-ring flex items-center justify-center gap-1"
            >
              <XCircle className="h-3 w-3" />
              Cancel All Items
            </button>
          )}
        </div>
      )}
      
      {/* Expandable Items Section */}
      <div className="border-t pt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-2 hover:bg-muted/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
          aria-expanded={isExpanded}
        >
          <span className="text-sm font-medium text-muted-foreground">
            {isExpanded ? 'Hide' : 'Show'} Items ({order.OrderItems?.length || 0})
          </span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-3 space-y-3">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Customer:</span> {order.BuyerName}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Address:</span> {order.ShippingAddressSnapshot}
              </p>
            </div>

            {/* Order Items - Display with images */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Items:</h4>
              {order.OrderItems?.map((item) => (
                <div key={item.Id} className="flex items-center gap-3 bg-muted/10 p-3 rounded">
                  {/* Product Image */}
                  <div className="relative w-12 h-12 rounded border overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={item.ProductImageUrl || '/placeholder-product.jpg'}
                      alt={item.ProductName || 'Product'}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{item.ProductName}</div>
                    <div className="text-xs text-muted-foreground">
                      Qty: {item.Quantity} • {formatCurrency(item.PriceAtOrderTime || 0, 'THB')} each
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.Status!} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}