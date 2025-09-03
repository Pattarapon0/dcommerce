import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Contact from '@/components/home/Contact';
import { PageLayout } from '@/components/layout/PageLayout';

export default function Home() {
  return (
    <PageLayout>
      <Hero />
      <Features />
      <Contact />
    </PageLayout>
  );
}
