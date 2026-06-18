import PageTransition from '../components/PageTransition/PageTransition';
import HeroRevamped from '../components/HeroRevamped/HeroRevamped';
import Philosophy from '../components/Philosophy/Philosophy';
import FounderStory from '../components/FounderStory/FounderStory';
import Heritage from '../components/Heritage/Heritage';
import CategoryShowcase from '../components/CategoryShowcase/CategoryShowcase';
import FeaturedTeas from '../components/FeaturedTeas/FeaturedTeas';
import KombuchaSpotlight from '../components/KombuchaSpotlight/KombuchaSpotlight';
import TastingCTA from '../components/TastingCTA/TastingCTA';
import CafePreview from '../components/CafePreview/CafePreview';
import Testimonials from '../components/Testimonials/Testimonials';
import GalleryStrip from '../components/GalleryStrip/GalleryStrip';

export default function Home() {
  return (
    <PageTransition>
      <HeroRevamped />
      <Philosophy />
      <FounderStory />
      <Heritage />
      <CategoryShowcase />
      <FeaturedTeas />
      <KombuchaSpotlight />
      <TastingCTA />
      <CafePreview />
      <Testimonials />
      <GalleryStrip />
    </PageTransition>
  );
}
