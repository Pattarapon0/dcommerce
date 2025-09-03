import { Metadata } from "next";
import CartPageClient from "@/components/features/cart/CartPageClient";
import { PageLayout } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Shopping Cart",
};

export default function CartPage() {
    return (
       <PageLayout>
          <CartPageClient />
       </PageLayout>
    );
}