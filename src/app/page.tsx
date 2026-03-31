import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero";
import ShopSection from "@/components/shop-section";
import SocialReels from "@/components/reels";
import TrustFeatures from "@/components/features";
import Footer from "@/components/footer";
import WhatsappButton from "@/components/whatsapp-button";
import CartDrawer from "@/components/cart-drawer";
import { SubscribeButton } from "@/components/subscribe-modal";

export default function Home() {
    return (
        <main className="min-h-[100dvh] relative selection:bg-brand-red selection:text-white pb-16 lg:pb-0 flex flex-col">
            <Navbar />
            <HeroSection />
            <ShopSection />
            <SocialReels />
            <TrustFeatures />
            <Footer />
            <WhatsappButton />
            <CartDrawer />
            <SubscribeButton />
        </main>
    );
}
