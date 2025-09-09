import { Metadata } from "next";
import OrderDetailPageClient from "@/components/features/orders/OrderDetailPageClient";

export const metadata: Metadata = {
  title: "Order Details",
};

export default function OrderDetailPage() {
  return <OrderDetailPageClient />;
}