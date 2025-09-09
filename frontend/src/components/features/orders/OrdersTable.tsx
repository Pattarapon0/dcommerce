"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, MapPin, MoreHorizontal, Eye, Package, CheckCircle, XCircle ,Truck,type LucideIcon} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import { OrderItemStatus, type OrderDto } from '@/lib/api/orders';
import { formatDate } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/currency';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import Image from "next/image";
 

interface OrdersTableProps {
  orders: OrderDto[];
  isLoading: boolean;
  onUpdateStatus: (orderItemId: string, status: string) => void;
  onCancelItem: (orderItemId: string) => void;
  onCancelOrder: (orderItemIds: string[]) => void;
  onUpdateOrderStatus?: (orderItemIds: string[], status: OrderItemStatus) => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
  onViewDetails?: (orderId: string) => void;
  onSort?: (columnId: string) => void;
  getSortDirection?: (columnId: string) => 'asc' | 'desc' | null;
  canSort?: boolean;
}

export default function OrdersTable(props: OrdersTableProps) {
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  // Status transition mapping
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
      'Closed': null // No actions available for closed orders
    };
    return statusMap[currentStatus] || null;
  };

  // Check if all seller's items have same status and can be batch updated
  const canBatchUpdateStatus = (order: OrderDto) => {
    if (!order.OrderItems || order.OrderItems.length === 0) return null;
    
    // For now, assume we're checking all items (seller filtering will come with API integration)
    const relevantItems = order.OrderItems;
    
    // Get unique statuses
    const statuses = [...new Set(relevantItems.map(item => item.Status))];
    
    // Must have exactly one status across all items
    if (statuses.length !== 1) return null;
    
    const currentStatus = statuses[0];
    
    // Skip if cancelled or delivered (terminal states)
    if (currentStatus === 'Cancelled' || currentStatus === 'Delivered') return null;
    
    // Get next status action
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

  // Check if any items can be cancelled
  const canBatchCancel = (order: OrderDto) => {
    if (!order.OrderItems || order.OrderItems.length === 0) return false;
    
    // For now, assume we're checking all items (seller filtering will come with API integration)
    const relevantItems = order.OrderItems;
    
    // Can cancel if any items are Pending or Processing
    return relevantItems.every(item => 
      item.Status === 'Pending' || item.Status === 'Processing'
    );
  };
  
  const toggleExpanded = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handleStatusChange = (orderItemId: string, newStatus: string) => {
    props.onUpdateStatus(orderItemId, newStatus);
  };

  const handleOrderStatusUpdate = async (order: OrderDto) => {
    const orderStatus = getOrderStatus(order);
    const nextAction = getNextStatusAction(orderStatus);
    
    if (!nextAction || !order.Id) return;

    try {
      // Update all processing/shipped items to next status
      const itemsToUpdate = order.OrderItems?.filter(item => {
        const itemNextAction = getNextStatusAction(item.Status!);
        return itemNextAction !== null;
      }) || [];

      props.onUpdateOrderStatus?.(itemsToUpdate.map(i => i.Id!), nextAction.nextStatus as OrderItemStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleOrderCancel = (order: OrderDto) => {
    if (!order.Id) return;
    
    try {
      props.onCancelOrder(order.OrderItems?.map(i => i.Id!) || []);
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const parseShippingAddress = (shippingAddress: string) => {
    const parts = shippingAddress.split(', ');
    if (parts.length < 3) return { address: shippingAddress, phone: null };
    
    // Phone is typically the last part
    const phone = parts[parts.length - 1];
    const address = parts.slice(0, -1).join(', ');
    
    // Simple phone validation (contains digits and common phone chars)
    const isPhone = /^[+]?[\d\s\-()]+$/.test(phone) && phone.length >= 10;
    
    return {
      address: isPhone ? address : shippingAddress,
      phone: isPhone ? phone : null
    };
  };

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

  return (
    <div className="bg-white rounded-lg border">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/30">
            <tr>
              <th className="p-4 text-left text-sm font-medium w-8"></th>
              <th className="p-4 text-left text-sm font-medium">Order #</th>
              <th className="p-4 text-left text-sm font-medium">Customer</th>
              <th className="p-4 text-left text-sm font-medium">Status</th>
              <th className="p-4 text-left text-sm font-medium">Total</th>
              <th className="hidden md:table-cell p-4 lg:pl-12 xl:pl-16 2xl:pl-20 text-left text-sm font-medium" data-priority="low">
                Date
              </th>
              <th className="p-4 lg:pr-12 xl:pr-16 2xl:pr-20 text-right text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {props.orders.map((order) => (
              <React.Fragment key={order.Id}>
                <tr className="hover:bg-muted/20 transition-colors border-b">
                  <td className="p-4">
                    <button 
                      onClick={() => toggleExpanded(order.Id!)}
                      className="p-1 hover:bg-muted/20 rounded focus:outline-none focus:ring-2 focus:ring-primary-300"
                      aria-label={expandedOrders[order.Id!] ? "Collapse order details" : "Expand order details"}
                    >
                      {expandedOrders[order.Id!] ? 
                        <ChevronDown className="h-4 w-4" /> : 
                        <ChevronRight className="h-4 w-4" />
                      }
                    </button>
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm font-semibold">
                    #{order.OrderNumber}
                  </td>
                  <td className="p-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{order.BuyerName}</div>
                      {order.ShippingAddressSnapshot && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <button 
                              className="p-1 hover:bg-muted/20 rounded focus:outline-none focus:ring-2 focus:ring-primary-300 text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="View shipping address"
                            >
                              <MapPin className="h-3 w-3" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80" align="start">
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Shipping Address</h4>
                              {(() => {
                                const { address, phone } = parseShippingAddress(order.ShippingAddressSnapshot || '');
                                return (
                                  <div className="text-sm space-y-1">
                                    <div className="text-muted-foreground whitespace-pre-wrap break-words">
                                      {address}
                                    </div>
                                    {phone && (
                                      <div className="font-medium flex items-center gap-1">
                                        <span>📞</span>
                                        <span>{phone}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm">
                    <StatusBadge status={getOrderStatus(order)} />
                  </td>
                  <td className="p-4 text-sm font-medium">{formatCurrency(order.Total || 0, 'THB')}</td>
                  <td className="hidden md:table-cell p-4 lg:pl-12 xl:pl-16 2xl:pl-20 text-sm text-muted-foreground" data-priority="low">
                    {formatDate(order.CreatedAt || '')}
                  </td>
                  <td className="p-4 lg:pr-12 xl:pr-16 2xl:pr-20 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary-300"
                          aria-label="Order actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                       <DropdownMenuContent align="end" className="w-48">
                         {/* View Details */}
                         <DropdownMenuItem onClick={() => props.onViewDetails?.(order.Id!)} className="text-gray-900">
                           <Eye className="h-4 w-4 mr-2" />
                           View Details
                         </DropdownMenuItem>
                         
                         {/* Batch Status Update */}
                         {(() => {
                           const batchUpdate = canBatchUpdateStatus(order);
                           
                           if (!batchUpdate) return null;
                           
                           const Icon = batchUpdate.icon;
                           
                           return (
                             <DropdownMenuItem 
                               onClick={() => {
                                 // Update all items with the current status to next status
                               handleOrderStatusUpdate(order);
                               }}
                               className="text-blue-600"
                             >
                               <Icon className="h-4 w-4 mr-2" />
                               {batchUpdate.actionText}
                             </DropdownMenuItem>
                           );
                         })()}
                         
                         {/* Batch Cancel */}
                         {(() => {
                           const canCancel = canBatchCancel(order);
                           
                           if (!canCancel) return null;
                           
                           return (
                             <DropdownMenuItem 
                               onClick={() =>  handleOrderCancel(order)}
                               className="text-red-600"
                             >
                               <XCircle className="h-4 w-4 mr-2" />
                               Cancel All My Items
                             </DropdownMenuItem>
                           );
                         })()}
                       </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                
                {/* Expanded order items */}
                {expandedOrders[order.Id!] && (
                  <tr>
                    <td colSpan={7} className="p-0">
                      <div className="bg-muted/10 p-4 border-b">
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-muted-foreground">Order Items</h4>
                          {order.OrderItems?.map((item) => (
                            <div key={item.Id} className="flex items-center gap-4 bg-white p-3 rounded border">
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
                              <div className="flex-1">
                                <div className="font-medium text-sm">{item.ProductName}</div>
                                <div className="text-xs text-muted-foreground">
                                  Qty: {item.Quantity} • {formatCurrency(item.PriceAtOrderTime || 0, 'THB')} each
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <StatusBadge status={item.Status!} />
                                <DropdownMenu>
                                  <DropdownMenuTrigger 
                                    className="px-2 py-1 text-xs border rounded hover:bg-muted/20 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                    disabled={props.isLoading || item.Status === 'Delivered' || item.Status === 'Cancelled'}
                                  >
                                    Update Status
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {item.Status === 'Pending' && (
                                      <DropdownMenuItem onClick={() => handleStatusChange(item.Id!, 'Processing')}>
                                        Mark as Processing
                                      </DropdownMenuItem>
                                    )}
                                    {item.Status === 'Processing' && (
                                      <DropdownMenuItem onClick={() => handleStatusChange(item.Id!, 'Shipped')}>
                                        Mark as Shipped
                                      </DropdownMenuItem>
                                    )}
                                    {item.Status === 'Shipped' && (
                                      <DropdownMenuItem onClick={() => handleStatusChange(item.Id!, 'Delivered')}>
                                        Mark as Delivered
                                      </DropdownMenuItem>
                                    )}
                                    {(item.Status === 'Processing' || item.Status === 'Pending') && (
                                      <DropdownMenuItem 
                                        onClick={() => props.onCancelItem(item.Id!)}
                                        className="text-red-600"
                                      >
                                        Cancel Item
                                      </DropdownMenuItem>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {props.totalPages > 1 && (
        <div className="p-4 border-t bg-muted/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {((props.currentPage - 1) * props.itemsPerPage) + 1} to {Math.min(props.currentPage * props.itemsPerPage, props.totalItems)} of {props.totalItems} orders
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => props.onPageChange(props.currentPage - 1)}
                disabled={props.currentPage === 1}
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/20"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, props.totalPages) }, (_, i) => {
                let pageNum;
                if (props.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (props.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (props.currentPage >= props.totalPages - 2) {
                  pageNum = props.totalPages - 4 + i;
                } else {
                  pageNum = props.currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => props.onPageChange(pageNum)}
                    className={`px-3 py-2 border rounded-lg text-sm ${
                      pageNum === props.currentPage 
                        ? 'bg-primary-600 text-white border-primary-600' 
                        : 'hover:bg-muted/20'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button 
                onClick={() => props.onPageChange(props.currentPage + 1)}
                disabled={props.currentPage === props.totalPages}
                className="px-3 py-2 border rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/20"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}