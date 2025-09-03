"use client";

import { Suspense } from "react";
import { SearchResultsPageClient } from "@/components/features/search/SearchResultsPageClient";
import { PageLayout } from "@/components/layout/PageLayout";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <PageLayout fullHeight className="bg-gray-50">
        <div className="flex items-center justify-center h-full">
          Loading...
        </div>
      </PageLayout>
    }>
      <SearchResultsPageClient />
    </Suspense>
  );
}