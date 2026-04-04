"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";

export default function HeroSection() {
    const ref = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    const [bgImage, setBgImage] = useState("/images/fondo-hero.png");

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        const saved = localStorage.getItem("hh_bg_hero");
        if (saved) setBgImage(saved);

        const handleStorage = (e: StorageEvent) => {
            if (e.key === "hh_bg_hero") setBgImage(e.newValue || "/images/fondo-hero.png");
        };
        window.addEventListener("storage", handleStorage);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener("storage", handleStorage);
        };
    }, []);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    // Disable parallax and fade on mobile to keep the background fixed
    const parallaxY = useTransform(scrollYProgress, [0, 1], ["0%", isMobile ? "0%" : "50%"]);
    const parallaxOpacity = useTransform(scrollYProgress, [0, 0.8], [1, isMobile ? 1 : 0]);

    return (
        <section ref={ref} id="hero" className="relative h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-black">
            {/* Background Image with Parallax (Parallax disabled on mobile) */}
            <motion.div style={{ y: parallaxY, opacity: parallaxOpacity }} className={`absolute inset-0 z-0 ${isMobile ? 'fixed' : ''}`}>
                <Image
                    src={bgImage}
                    alt="Urban Street Graffiti Background"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
            </motion.div>

            <div className="relative z-10 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 text-center mt-12 md:mt-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="mb-8 relative flex items-center justify-center"
                >
                    <style jsx>{`
                        @keyframes rotate-logo {
                            0% { transform: rotate(0deg); }
                            15% { transform: rotate(360deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}</style>
                    <div
                        className="relative w-[150px] h-[120px] md:w-[250px] md:h-[200px]"
                        style={{
                            animation: "rotate-logo 5s cubic-bezier(0.22, 1, 0.36, 1) infinite",
                            willChange: "transform",
                        }}
                    >
                        <Image
                            src="/images/logo.png"
                            alt="HIGHHOOD logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="pb-12 md:pb-24"
                >
                    <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-white mb-4 md:mb-6 tracking-wide drop-shadow-xl leading-tight">
                        FROM THE <span className="text-brand-red">HOOD</span><br />
                        TO THE <span className="text-white">WORLD</span>
                    </h1>

                    <p className="text-white/80 text-sm sm:text-lg md:text-xl font-medium tracking-widest uppercase mb-10 md:mb-12 max-w-2xl mx-auto px-4">
                        Premium streetwear culture. Oversized aesthetics.
                    </p>

                    <Link href="#shop" onClick={(e) => {
                        e.preventDefault();
                        const element = document.getElementById('shop');
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                        }
                    }}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-brand-red text-white px-6 py-3 sm:px-8 sm:py-4 text-xs sm:text-sm md:text-base font-bold tracking-[0.2em] uppercase flex items-center gap-2 sm:gap-3 mx-auto hover:bg-white hover:text-brand-black transition-colors duration-300 shadow-[0_0_20px_rgba(204,0,0,0.4)]"
                        >
                            Shop The Drop
                            <ArrowRight size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>

            {/* Bottom fade into Shop Section */}
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

        </section>
    );
}
