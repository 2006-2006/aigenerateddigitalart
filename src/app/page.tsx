import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/landing/HeroSection';
import FeaturesSection from '@/components/landing/FeaturesSection';
import GalleryPreviewSection from '@/components/landing/GalleryPreviewSection';
import PricingSection from '@/components/landing/PricingSection';
import FAQSection from '@/components/landing/FAQSection';
import CTASection from '@/components/landing/CTASection';

export default function HomePage() {
    return (
        <main className="min-h-screen">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <GalleryPreviewSection />
            <PricingSection />
            <FAQSection />
            <CTASection />
            <Footer />
        </main>
    );
}
