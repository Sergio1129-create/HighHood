"use client";

import { useState, useRef } from "react";
import { brands, products } from "@/data";
import {
    motion,
    AnimatePresence,
    useScroll,
    useVelocity,
    useSpring,
    useTransform,
    useAnimationFrame,
    useMotionValue,
    useMotionValueEvent
} from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Helper to wrap values for infinite scrolling
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export default function ShopSection() {
    const [activeBrand, setActiveBrand] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    // Parallax & Kinetic Typography Engine
    const sectionRef = useRef<HTMLElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const baseX = useRef(0);

    // Video Scrubbing Logic
    const { scrollYProgress, scrollY } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Smooth the progress for video scrubbing
    const smoothVideoProgress = useSpring(scrollYProgress, {
        stiffness: 150,
        damping: 40
    });

    // Update video frame safely
    useMotionValueEvent(smoothVideoProgress, "change", (latest) => {
        if (videoRef.current && videoRef.current.readyState >= 2) {
            const nextTime = latest * videoRef.current.duration;
            // Prevent setting currentTime on initial render if already 0 (avoids browser auto-scroll to media)
            if (nextTime === 0 && videoRef.current.currentTime === 0) return;

            videoRef.current.currentTime = nextTime;
        }
    });

    const scrollVelocity = useVelocity(scrollY);

    // Smooth the velocity for organic movement
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    });

    // Skew effect (wave) based on velocity
    // Range: Map a scroll velocity of [-2000, 2000] to a skew of [-15, 15] degrees for a refined tilt
    const skewX = useTransform(smoothVelocity, [-2000, 2000], [-15, 15]);

    const directionFactor = useRef<number>(1);
    const x = useMotionValue("0%");

    useAnimationFrame((t, delta) => {
        if (!isHovered) {
            const baseVelocity = 1.2; // Steady base speed
            let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

            // Directional Scroll Sync
            const currentVelocity = smoothVelocity.get() * 2.0;
            if (currentVelocity > 0) {
                directionFactor.current = 1; // Scrolling down = right
            } else if (currentVelocity < 0) {
                directionFactor.current = -1; // Scrolling up = left
            }

            // Exponential momentum only when scrolling
            if (Math.abs(currentVelocity) > 0) {
                moveBy += directionFactor.current * Math.abs(currentVelocity) * 0.005 * (delta / 1000);
            }

            // Base Math for movement
            baseX.current += moveBy;

            // Modulus operator to ensure the text wraps perfectly without jumps
            x.set(`${wrap(-50, 0, baseX.current)}%`);
        }
    });

    const manualScroll = (direction: -1 | 1) => {
        directionFactor.current = direction;
        baseX.current += direction * 10; // Fixed 10% translation nudge
        x.set(`${wrap(-50, 0, baseX.current)}%`); // Update visually immediately
    };

    const filteredProducts = activeBrand
        ? products.filter((p) => p.brand === activeBrand)
        : products;

    return (
        <section
            id="shop"
            ref={sectionRef}
            className="pt-20 pb-0 bg-brand-bg relative z-20 overflow-hidden"
        >
            {/* Blurred background image — only visible on the sides of the video */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: "url('/images/fondo-shop-section.png')",
                    backgroundSize: "auto 60%",
                    backgroundPosition: "center 100%",
                    filter: "blur(3px)",
                    zIndex: 0,
                }}
            />
            {/* Block the blurred bg behind the video center — only sides visible */}
            <div className="absolute top-0 bottom-0 left-[27.5%] right-[27.5%] bg-brand-bg pointer-events-none" style={{ zIndex: 1 }} />
            {/* White overlay to add extra opacity/muting to the side bg image */}
            <div className="absolute inset-y-0 left-0 w-[27.5%] bg-brand-bg/60 pointer-events-none" style={{ zIndex: 1 }} />
            <div className="absolute inset-y-0 right-0 w-[27.5%] bg-brand-bg/60 pointer-events-none" style={{ zIndex: 1 }} />

            {/* Video Background */}
            <video
                ref={videoRef}
                src="/images/shop-section-video.mp4"
                muted
                playsInline
                loop
                preload="auto"
                className={`absolute top-0 left-0 w-full h-full object-cover scale-[0.45] -translate-y-[10%] md:-translate-y-[15%] z-[1] opacity-40 pointer-events-none will-change-transform transition-[filter] duration-500 origin-top ${activeBrand ? "blur-[4px]" : ""
                    }`}
            />

            {/* Brands Kinetic Carousel Area */}
            <div className="w-full overflow-hidden border-b border-black/5 pb-10 mb-16 relative z-10">
                <div className="text-center mb-12">
                    <h2 className="font-heading text-3xl md:text-4xl text-brand-black uppercase tracking-widest">
                        Curated Brands
                    </h2>
                    <p className="text-sm text-neutral-500 mt-2 uppercase tracking-widest">
                        Select to filter
                    </p>
                </div>

                {/* Arrow Navigation */}
                <button
                    onClick={() => manualScroll(1)}
                    className="absolute left-4 top-[70%] z-30 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-brand-black hover:text-brand-red transition-colors"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={() => manualScroll(-1)}
                    className="absolute right-4 top-[70%] z-30 p-2 bg-white/80 backdrop-blur-md rounded-full shadow-lg text-brand-black hover:text-brand-red transition-colors"
                >
                    <ChevronRight size={24} />
                </button>

                <div className="relative group flex overflow-x-hidden w-full py-8">
                    <motion.div
                        className="flex w-max items-center will-change-transform"
                        style={{
                            x,
                            skewX, // Apply wave directly to motion wrapper
                            whiteSpace: "nowrap" // Use style instead of conflicting tailwind class
                        }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={() => setIsHovered(true)}
                        onTouchEnd={() => setIsHovered(false)}
                    >
                        {/* 4 sets of brands for seamless -50% looping */}
                        {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
                            <button
                                key={`${brand}-${i}`}
                                onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
                                className={`mx-12 md:mx-16 font-heading italic text-5xl md:text-6xl lg:text-7xl transition-colors duration-300 uppercase ${activeBrand === brand
                                    ? "text-brand-red drop-shadow-md"
                                    : "text-brand-black/70 hover:text-brand-black"
                                    }`}
                            >
                                {brand}
                            </button>
                        ))}
                    </motion.div>
                </div>


            </div>

            {/* Products Grid Area */}
            <div className="relative w-full bg-brand-black/95 py-16 z-10">
                {/* Scroll Indicator — sits at the top of the products area */}
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-14 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none"
                >
                    <span className="text-[9px] tracking-widest uppercase mb-1 font-bold text-white/60">Scroll</span>
                    <div className="w-[1px] h-8 bg-gradient-to-b from-white/60 to-transparent" />
                </motion.div>
                {/* Gradient fade at the top for smooth section transition */}
                <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-brand-black to-transparent z-20 pointer-events-none" />
                {/* Gradient fade at the bottom for smooth transition into Reels */}
                <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-brand-black to-transparent z-20 pointer-events-none" />
                {/* Background Image Overlay */}
                <Image
                    src="/images/brands-bg.png"
                    alt="Street Graffiti Background"
                    fill
                    className="object-cover object-center opacity-15 pointer-events-none"
                />
                <div className="container relative z-10 mx-auto px-4 md:px-8">
                    <div className="flex justify-between items-end mb-10">
                        <h2 className="font-heading text-4xl md:text-5xl text-white drop-shadow-md">
                            {activeBrand ? `${activeBrand} DROPS` : "TRENDING NOW"}
                        </h2>
                        {activeBrand && (
                            <button
                                onClick={() => setActiveBrand(null)}
                                className="text-sm uppercase tracking-widest text-white/60 hover:text-brand-red border-b border-transparent hover:border-brand-red pb-1 transition-all"
                            >
                                Clear Filter
                            </button>
                        )}
                    </div>

                    <motion.div
                        layout
                        initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10"
                    >
                        <AnimatePresence mode="popLayout">
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ duration: 0.4 }}
                                    className="group flex flex-col"
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                                        {/* Hover Add to cart button */}
                                        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                                            <button className="w-full bg-brand-black/90 backdrop-blur-sm text-white py-4 text-xs font-bold tracking-[0.2em] hover:bg-brand-red transition-colors">
                                                QUICK ADD
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-5 text-center px-2">
                                        <h3 className="text-sm font-medium text-neutral-400 uppercase tracking-widest leading-relaxed line-clamp-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-neutral-400 font-sans mt-2">
                                            ${product.price} COP
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {filteredProducts.length === 0 && (
                            <motion.div
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="col-span-full py-20 text-center text-neutral-500 uppercase tracking-widest"
                            >
                                No products found for this brand yet.
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Load More Button */}
                    {!activeBrand && (
                        <div className="mt-16 text-center">
                            <button className="border border-white text-white px-10 py-4 uppercase tracking-widest text-sm hover:bg-white hover:text-brand-black transition-colors duration-300">
                                View All Products
                            </button>
                        </div>
                    )}


                </div>
            </div>
        </section>
    );
}
