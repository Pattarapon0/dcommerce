import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TopSellingProducts from '@/components/home/TopSellingProducts';
import { PageLayout } from '@/components/layout/PageLayout';

export default function Home() {
  return (
    <PageLayout>
      <Hero />
      <Features />
      <FeaturedProducts />
      <TopSellingProducts />
    </PageLayout>
  );
}
