import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero";
import ShopSection from "@/components/shop-section";
import SocialReels from "@/components/reels";
import TrustFeatures from "@/components/features";
import Footer from "@/components/footer";
import WhatsappButton from "@/components/whatsapp-button";

export default function Home() {
    return (
        <main className="min-h-screen relative selection:bg-brand-red selection:text-white pb-24 lg:pb-0">
            <Navbar />
            <HeroSection />
            <ShopSection />
            <SocialReels />
            <TrustFeatures />
            <Footer />
            <WhatsappButton />
        </main>
    );
}
