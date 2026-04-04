"use client";

import { useRef, useState, useEffect } from "react";
import { reels } from "@/data";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SocialReels() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [playingId, setPlayingId] = useState<string | number | null>(null);

    // Custom scroll handler since we want horizontal scrolling with mouse wheel 
    // (optional enhancement for desktop UX)
    const handleScroll = (e: React.WheelEvent) => {
        if (containerRef.current && e.deltaY !== 0) {
            containerRef.current.scrollLeft += e.deltaY;
            setPlayingId(null); // Auto-pause playing video on wheel scroll
        }
    };

    const scrollNav = (direction: number) => {
        if (containerRef.current) {
            const scrollAmount = window.innerWidth < 640 ? 250 : 320;
            containerRef.current.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
            setPlayingId(null); // Auto-pause playing video on arrow navigation
        }
    };

    const [bgImage, setBgImage] = useState("/images/fondo-reels.png");

    useEffect(() => {
        const saved = localStorage.getItem("hh_bg_reels");
        if (saved) setBgImage(saved);

        const handleStorage = (e: StorageEvent) => {
            if (e.key === "hh_bg_reels") setBgImage(e.newValue || "/images/fondo-reels.png");
        };
        window.addEventListener("storage", handleStorage);

        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    // Auto-pause when native mobile swiping occurs
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        
        let isScrolling: ReturnType<typeof setTimeout>;
        const handleNativeScroll = () => {
            clearTimeout(isScrolling);
            isScrolling = setTimeout(() => {
                setPlayingId(null);
            }, 100);
        };
        
        container.addEventListener('scroll', handleNativeScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleNativeScroll);
    }, []);

    return (
        <section id="community" className="bg-brand-black overflow-hidden relative pb-16 sm:pb-20">
            {/* Background Image */}
            <Image
                src={bgImage}
                alt="Reels Background"
                fill
                className="object-cover object-center opacity-20 pointer-events-none z-0"
            />
            {/* Top fade from previous section */}
            <div className="absolute top-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-b from-brand-black/95 to-transparent z-20 pointer-events-none" />
            {/* Bottom fade to next section */}
            <div className="absolute bottom-0 inset-x-0 h-16 sm:h-24 bg-gradient-to-t from-brand-black/95 to-transparent z-20 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-8 mb-8 sm:mb-12 pt-16 sm:pt-24">
                <h2 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white text-center tracking-widest uppercase mb-4">
                    STREET <span className="text-brand-red">VISION</span>
                </h2>
                <p className="text-center text-white/50 uppercase tracking-widest text-[10px] sm:text-xs md:text-sm max-w-xl mx-auto px-2">
                    Community drops, lifestyle, and behind the scenes. Follow the movement.
                </p>
            </div>

            {/* Minimalist Navigation Arrows */}
            <button 
                onClick={() => scrollNav(-1)} 
                className="absolute left-0 sm:left-4 top-1/2 mt-16 sm:mt-12 -translate-y-1/2 z-30 text-white/30 hover:text-white/80 hover:scale-110 transition-all p-2"
                aria-label="Scroll left"
            >
                <ChevronLeft className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg" strokeWidth={1.5} />
            </button>
            <button 
                onClick={() => scrollNav(1)} 
                className="absolute right-0 sm:right-4 top-1/2 mt-16 sm:mt-12 -translate-y-1/2 z-30 text-white/30 hover:text-white/80 hover:scale-110 transition-all p-2"
                aria-label="Scroll right"
            >
                <ChevronRight className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-lg" strokeWidth={1.5} />
            </button>

            <motion.div
                ref={containerRef}
                onWheel={handleScroll}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-50px" }}
                variants={{
                    hidden: {},
                    show: {
                        transition: {
                            staggerChildren: 0.15
                        }
                    }
                }}
                className="flex overflow-x-auto gap-8 sm:gap-10 md:gap-12 px-6 md:px-12 pb-10 snap-x snap-mandatory no-scrollbar"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                {reels.map((reel) => (
                    <motion.div
                        key={reel.id}
                        variants={{
                            hidden: { opacity: 0, y: 50 },
                            show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
                        }}
                        className="relative flex-shrink-0 w-[190px] h-[460px] sm:w-[220px] sm:h-[500px] md:w-[260px] md:h-[560px] snap-center rounded-[20px] overflow-hidden group bg-white shadow-xl"
                    >
                        {reel.isEmbed ? (
                            <div className="absolute inset-0 overflow-hidden rounded-[20px] bg-white">
                                <iframe
                                    src={reel.videoUrl}
                                    className="absolute inset-0 w-full h-full border-none"
                                    scrolling="no"
                                    frameBorder="0"
                                    allowFullScreen
                                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
                                    title="Instagram Reel Embed"
                                />
                            </div>
                        ) : (
                            <>
                                {/* Poster Image */}
                                <Image
                                    src={reel.poster}
                                    alt="Social Reel Preview"
                                    fill
                                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                                />

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />

                                {/* Play Button Icon */}
                                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${playingId === reel.id ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-red/90 backdrop-blur-md rounded-full flex items-center justify-center text-white pl-1 shadow-[0_0_20px_rgba(204,0,0,0.5)]">
                                        <Play size={24} fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                </div>

                                {/* Bottom Content */}
                                <div className={`absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white z-10 pointer-events-none transition-opacity duration-300 ${playingId === reel.id ? 'opacity-0' : 'opacity-100'}`}>
                                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden relative border border-white/20">
                                            <Image src="/images/logo.png" alt="Highhood Avatar" fill className="object-contain bg-black" />
                                        </div>
                                        <span className="font-bold text-xs sm:text-sm tracking-widest">@highhood_</span>
                                    </div>
                                    <p className="text-[10px] sm:text-xs text-white/70 tracking-widest line-clamp-2">
                                        New arrivals online. The streets are watching. 🔥
                                    </p>
                                </div>

                                {/* Click Overlay to capture user tap */}
                                <div 
                                    className="absolute inset-0 z-20 cursor-pointer" 
                                    onClick={() => setPlayingId(playingId === reel.id ? null : reel.id)}
                                />

                                {/* Video element */}
                                <video
                                    src={reel.videoUrl}
                                    loop
                                    muted
                                    playsInline
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 ${playingId === reel.id ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                                    ref={(el) => {
                                        if (el) {
                                            if (playingId === reel.id) {
                                                el.play().catch(() => console.log('Autoplay blocked'));
                                            } else {
                                                el.pause();
                                                el.currentTime = 0;
                                            }
                                        }
                                    }}
                                />
                            </>
                        )}
                    </motion.div>
                ))}
            </motion.div>
        </section>
    );
}
