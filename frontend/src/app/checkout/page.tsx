import { Metadata } from "next";
import CheckoutPageClient from "@/components/features/checkout/CheckoutPageClient";
import { PageLayout } from "@/components/layout/PageLayout";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
    return (
       <PageLayout>
          <CheckoutPageClient />
       </PageLayout>
    );
}