"use client";

import { useState, useRef, useEffect } from "react";
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
import { useCart } from "@/context/CartContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";

// Helper to wrap values for infinite scrolling
const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

interface Product {
    id: string | number;
    name: string;
    brand: string;
    price: number;
    image: string;
    trending?: boolean;
    onSale?: boolean;
    salePrice?: number;
}

const ProductCarousel = ({ title, data, badgeStr, isOffer }: { title: string, data: Product[], badgeStr?: string, isOffer?: boolean }) => {
    const { addItem } = useCart();

    // Custom Navigation Button setup
    const prevRef = useRef<HTMLButtonElement>(null);
    const nextRef = useRef<HTMLButtonElement>(null);
    const [_, setInit] = useState<boolean>(false);

    if (data.length === 0) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-6 sm:mb-8 md:mb-10 last:mb-0"
        >
            <div className="flex items-center justify-between mb-4 sm:mb-6 md:mb-8 px-4 md:px-8 max-w-[1600px] mx-auto relative z-20">
                <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white drop-shadow-md uppercase tracking-widest flex items-center gap-3">
                    {title}
                    {badgeStr && <span className="text-4xl sm:text-5xl md:text-6xl animate-bounce">{badgeStr}</span>}
                </h2>
                <div className="hidden sm:flex gap-3">
                    <button ref={prevRef} className="p-2 sm:p-3 rounded-full border border-white/30 text-white hover:bg-white hover:text-brand-black transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white">
                        <ChevronLeft size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button ref={nextRef} className="p-2 sm:p-3 rounded-full border border-white/30 text-white hover:bg-white hover:text-brand-black transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-white">
                        <ChevronRight size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                </div>
            </div>

            <div className="pl-4 md:pl-8 max-w-[1600px] mx-auto relative z-20">
                <Swiper
                    modules={[Navigation, FreeMode]}
                    spaceBetween={16}
                    slidesPerView={1.5}
                    freeMode={true}
                    onInit={() => setInit(true)}
                    navigation={{
                        prevEl: prevRef.current,
                        nextEl: nextRef.current,
                    }}
                    breakpoints={{
                        480: { slidesPerView: 2.2, spaceBetween: 20 },
                        768: { slidesPerView: 3.2, spaceBetween: 24 },
                        1024: { slidesPerView: 4.2, spaceBetween: 30 },
                        1280: { slidesPerView: 5.2, spaceBetween: 30 },
                    }}
                    className="!pr-4 md:!pr-8"
                >
                    {data.map((product) => (
                        <SwiperSlide key={product.id} className="h-auto px-1 pb-4">
                            <div className="group flex flex-col h-full bg-transparent overflow-hidden transition-all duration-300">

                                <div className="relative aspect-[3/4] overflow-hidden rounded-sm">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 480px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-300 pointer-events-none" />

                                    {/* Badges Overlay */}
                                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                                        {isOffer && product.onSale && (
                                            <span className="bg-brand-red text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 uppercase tracking-widest rounded-sm shadow-md">
                                                OFFER
                                            </span>
                                        )}
                                        {product.brand && (
                                            <span className="bg-brand-black/90 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 uppercase tracking-widest rounded-sm shadow-md">
                                                {product.brand}
                                            </span>
                                        )}
                                    </div>

                                    {/* Hover Add to cart button */}
                                    <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                                        <button
                                            onClick={() => addItem(product)}
                                            className="w-full bg-brand-black/90 backdrop-blur-sm text-white py-3 sm:py-4 text-[10px] sm:text-xs font-bold tracking-[0.2em] hover:bg-brand-red transition-colors uppercase"
                                        >
                                            QUICK ADD
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 sm:mt-5 text-center px-1 sm:px-2 flex flex-col flex-1">
                                    <h3 className="text-xs sm:text-sm font-medium text-neutral-400 uppercase tracking-widest leading-relaxed line-clamp-2">
                                        {product.name}
                                    </h3>

                                    <div className="flex items-center justify-center gap-2 mt-1 sm:mt-2">
                                        {isOffer && product.salePrice ? (
                                            <>
                                                <span className="text-xs sm:text-sm font-bold text-brand-red">
                                                    ${product.salePrice.toLocaleString('es-CO')}
                                                </span>
                                                <span className="text-[10px] sm:text-xs text-neutral-500 line-through">
                                                    ${product.price.toLocaleString('es-CO')}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-xs sm:text-sm text-neutral-400 font-sans">
                                                ${product.price.toLocaleString('es-CO')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </motion.div>
    );
};

export default function ShopSection() {
    const [activeBrand, setActiveBrand] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const { addItem } = useCart();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Listen for brand-select events from the Navbar dropdown
    useEffect(() => {
        const handler = (e: Event) => {
            const brand = (e as CustomEvent).detail;
            if (typeof brand === "string") setActiveBrand(brand);
        };
        window.addEventListener("highhood:setBrand", handler);
        return () => window.removeEventListener("highhood:setBrand", handler);
    }, []);

    // 2. Kinetic Scrubbing Logic
    const sectionRef = useRef<HTMLElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const baseX = useRef(0);

    // Play normally on mobile to avoid scrub decoding lag
    useEffect(() => {
        if (videoRef.current) {
            if (isMobile) {
                videoRef.current.play().catch(() => {});
                videoRef.current.loop = true;
            } else {
                videoRef.current.pause();
                videoRef.current.loop = false;
            }
        }
    }, [isMobile]);

    const { scrollYProgress, scrollY } = useScroll({
        target: sectionRef,
        offset: ["start end", "end start"]
    });

    // Immediate sync: removes the delay/lag from the spring solver
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        if (isMobile) return; // Disable expensive video hardware scrubbing on phones
        if (videoRef.current && videoRef.current.readyState >= 2 && !isNaN(videoRef.current.duration)) {
            // Direct 1:1 hardware mapping to scrollbar (covering 40% of video)
            const nextTime = (latest * 0.4) * videoRef.current.duration;
            if (nextTime === 0 && videoRef.current.currentTime === 0) return;
            videoRef.current.currentTime = nextTime;
        }
    });

    // Wave/Skew engine
    const scrollVelocity = useVelocity(scrollY);
    const smoothVelocity = useSpring(scrollVelocity, {
        stiffness: 100, // Reduced stiffness for smoother text behavior
        damping: 30
    });
    // Reduced skew range to be computationally lighter and smoother
    const skewX = useTransform(smoothVelocity, [-1000, 1000], [-5, 5]);
    const directionFactor = useRef<number>(1);
    const x = useMotionValue("0%");

    useAnimationFrame((t, delta) => {
        if (!isHovered) {
            const baseVelocity = 1.2;
            let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

            const currentVelocity = smoothVelocity.get() * 2.0;
            if (currentVelocity > 0) directionFactor.current = 1;
            else if (currentVelocity < 0) directionFactor.current = -1;

            if (Math.abs(currentVelocity) > 0) {
                moveBy += directionFactor.current * Math.abs(currentVelocity) * 0.005 * (delta / 1000);
            }

            baseX.current += moveBy;
            x.set(`${wrap(-50, 0, baseX.current)}%`);
        }
    });

    const manualScroll = (direction: -1 | 1) => {
        directionFactor.current = direction;
        baseX.current += direction * 10;
        x.set(`${wrap(-50, 0, baseX.current)}%`);
    };

    const filteredProducts = activeBrand
        ? products.filter((p) => p.brand === activeBrand)
        : products;

    return (
        <div id="shop" className="w-full flex flex-col bg-brand-black relative">
            {/* 1. Structural Layering (Upper "Curated Brands" area) */}
            <section
                ref={sectionRef}
                className="relative w-full min-h-[40vh] md:min-h-[70vh] overflow-hidden flex flex-col justify-center py-16"
            >

                {/* Layer 1: Conditional GPU Video or Static Mobile Hero Background */}
                {isMobile ? (
                    <>
                        {/* 3D Background Layer: Sofa */}
                        <Image
                            src="/images/fondo-movil-3D-sofa.png"
                            alt="Sofa Background"
                            fill
                            className="absolute inset-0 object-cover object-center z-0 pointer-events-none opacity-40 blur-sm scale-110"
                            priority
                        />
                        {/* 3D Foreground Layer: Persona */}
                        <Image
                            src="/images/fondo-movil-3D-persona.png"
                            alt="Persona Foreground"
                            fill
                            className="absolute inset-0 object-cover object-center z-0 pointer-events-none opacity-85"
                            priority
                        />
                    </>
                ) : (
                    <video
                        ref={videoRef}
                        src="/images/shop-section-video.mp4"
                        muted
                        playsInline
                        autoPlay={false}
                        preload="metadata"
                        style={{ WebkitPlaysInline: true } as any}
                        className="absolute inset-0 w-full h-full object-cover object-center z-0 pointer-events-none opacity-50"
                    />
                )}

                {/* Layer 2 (The Transfer Overlay): optimized to flat transparency instead of expensive backdrop blur */}
                <div className="absolute inset-0 bg-black/60 z-0 pointer-events-none" />

                {/* Layer 3 (The UI): The "CURATED BRANDS" header and the infinite brands carousel */}
                <div className="relative z-10 w-full">
                    <div className="text-center mb-12 sm:mb-16">
                        <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl text-white uppercase tracking-widest drop-shadow-lg">
                            Curated Brands
                        </h2>
                        <p className="text-xs sm:text-sm text-neutral-300 mt-2 uppercase tracking-widest">
                            Select to filter
                        </p>
                    </div>

                    {/* Arrow Navigation */}
                    <button
                        onClick={() => manualScroll(1)}
                        className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/30 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white hover:text-brand-black transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={() => manualScroll(-1)}
                        className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-black/30 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-white hover:text-brand-black transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="relative group flex overflow-x-hidden w-full py-8 md:py-12">
                        <motion.div
                            className="flex w-max items-center will-change-transform"
                            style={{ x, skewX, whiteSpace: "nowrap" }}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                            onTouchStart={() => setIsHovered(true)}
                            onTouchEnd={() => setIsHovered(false)}
                        >
                            {/* 4 sets of brands for seamless looping */}
                            {[...brands, ...brands, ...brands, ...brands].map((brand, i) => (
                                <button
                                    key={`${brand}-${i}`}
                                    onClick={() => setActiveBrand(activeBrand === brand ? null : brand)}
                                    className={`mx-6 sm:mx-10 md:mx-16 font-heading italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl transition-all duration-300 uppercase ${activeBrand === brand
                                        ? "text-brand-red opacity-100 scale-105 drop-shadow-[0_0_15px_rgba(204,0,0,0.8)]"
                                        : "text-white/70 hover:text-white"
                                        }`}
                                >
                                    {brand}
                                </button>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 4. Products Grid Area (Trending Now) logic untouched background does not conflict */}
            <section id="trending-now" className="relative w-full bg-[#1A1A1A] py-16 md:py-24 z-20 min-h-screen border-t border-white/10">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                {/* Fallback pattern logic untouched if desired, keeping clean #1A1A1A */}
                <Image
                    src="/images/brands-bg.png"
                    alt="Street Graffiti Background"
                    fill
                    className="absolute inset-0 object-cover object-center opacity-30 pointer-events-none mix-blend-overlay"
                />

                <div className="container relative z-10 mx-auto px-4 md:px-8">
                    <div className="flex justify-end items-end mb-8 md:mb-10">
                        {activeBrand && (
                            <button
                                onClick={() => setActiveBrand(null)}
                                className="text-xs sm:text-sm uppercase tracking-[0.2em] text-white/50 hover:text-brand-red border-b border-white/50 hover:border-brand-red pb-1 transition-all"
                            >
                                Clear Filter: {activeBrand}
                            </button>
                        )}
                    </div>

                    <ProductCarousel
                        title={activeBrand ? `${activeBrand} DROPS` : "Trending Now"}
                        badgeStr={!activeBrand ? "🔥" : undefined}
                        data={filteredProducts.filter(p => activeBrand ? true : p.trending)}
                    />

                    <ProductCarousel
                        title="Offers"
                        badgeStr="💸"
                        data={filteredProducts.filter(p => activeBrand ? p.onSale : p.onSale)}
                        isOffer={true}
                    />

                    <ProductCarousel
                        title="All Products"
                        data={filteredProducts}
                    />

                    {/* Load More Button */}
                    {!activeBrand && (
                        <div className="mt-16 text-center pb-20">
                            <button className="border border-white/20 text-white px-10 py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-white hover:text-brand-black transition-colors duration-300 rounded-sm">
                                View All Products
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
