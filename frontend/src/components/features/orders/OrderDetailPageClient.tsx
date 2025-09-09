"use client";

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import OrderHeader from './OrderHeader';
import OrderItemsList from './OrderItemsList';
import OrderSummary from './OrderSummary';
import ShippingInfo from './ShippingInfo';
import { useGetOrder } from '@/hooks/useOrder';
import { useCancelOrder, useReorderItems } from '@/hooks/useOrderMutations';
import type { components } from '@/lib/types/api';

type OrderItemDto = components['schemas']['OrderItemDto'];

export default function OrderDetailPageClient() {
  const params = useParams();
  const router = useRouter();
  
  // Real API calls
  const orderId = params.id as string;
  const { data: order, isLoading: loading, error } = useGetOrder(orderId);
  const cancelMutation = useCancelOrder();
  const reorderMutation = useReorderItems();

  const canCancel = order?.OrderItems?.some((item: OrderItemDto) => 
    item.Status === 'Processing' || item.Status === 'Pending'
  );

  const handleCancel = () => {
    if (order?.Id) {
      cancelMutation.mutate(order.Id);
    }
  };

  const handleReorder = () => {
    if (order?.OrderItems) {
      reorderMutation.mutate(order.OrderItems);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error || !order) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <h1 className="text-xl font-bold mb-4">Order not found</h1>
          <p className="text-gray-600 mb-6">This order doesn&apos;t exist or you don&apos;t have access to it.</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Go Back
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Orders
        </button>

        <OrderHeader
          order={order}
          onReorder={handleReorder}
          onCancel={handleCancel}
          canCancel={canCancel || false}
          isReordering={reorderMutation.isPending}
          isCancelling={cancelMutation.isPending}
        />

        <OrderItemsList order={order} />

        <div className="grid md:grid-cols-2 gap-6">
          <OrderSummary order={order} />
          <ShippingInfo order={order} />
        </div>
      </div>
    </PageLayout>
  );
}