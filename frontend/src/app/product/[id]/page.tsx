import { Suspense } from "react";
import ProductPageClient from "@/components/features/products/ProductPageClient";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

function ProductPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<ProductPageSkeleton />}>
      <ProductPageClient productId={id} />
    </Suspense>
  );
}