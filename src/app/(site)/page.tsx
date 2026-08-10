import type { Metadata } from 'next';
import { CaseCompare } from '../../components/home/case-compare';
import { CtaBanner } from '../../components/home/cta-banner';
import { Hero } from '../../components/home/hero';
import { PricePreview } from '../../components/home/price-preview';
import { ProcessSteps } from '../../components/home/process-steps';
import { ReviewsCarousel } from '../../components/home/reviews-carousel';
import { ServicePillars } from '../../components/home/service-pillars';
import { StatsBoard } from '../../components/home/stats-board';
import { TrustBadges } from '../../components/home/trust-badges';
import { siteConfig } from '../../config/site';

export const metadata: Metadata = {
  title: `${siteConfig.name} 凱西維修｜${siteConfig.slogan}`,
  description: siteConfig.description,
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBadges />
      <StatsBoard />
      <PricePreview />
      <CaseCompare />
      <ReviewsCarousel />
      <ProcessSteps />
      <ServicePillars />
      <CtaBanner />
    </>
  );
}
