import { BrandStrip } from "@/components/public/brand-strip";
import { FeaturedCourses } from "@/components/public/featured-courses";
import { Hero } from "@/components/public/hero";
import { SiteShell } from "@/components/public/site-shell";

export default function HomePage() {
  return (
    <SiteShell activePath="/">
      <Hero />
      <BrandStrip />
      <FeaturedCourses />
    </SiteShell>
  );
}
