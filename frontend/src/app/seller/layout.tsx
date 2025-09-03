import { PageLayout } from "@/components/layout/PageLayout";

interface SellerLayoutProps {
  children: React.ReactNode;
}

export default function SellerLayout({ children }: SellerLayoutProps) {
  return (
    <PageLayout fullHeight className="bg-background">
      {children}
    </PageLayout>
  );
}