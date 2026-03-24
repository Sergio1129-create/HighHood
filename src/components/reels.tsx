"use client";

import { useRef } from "react";
import { reels } from "@/data";
import { Play, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function SocialReels() {
    const containerRef = useRef<HTMLDivElement>(null);

    // Custom scroll handler since we want horizontal scrolling with mouse wheel 
    // (optional enhancement for desktop UX)
    const handleScroll = (e: React.WheelEvent) => {
        if (containerRef.current && e.deltaY !== 0) {
            // Prevent default vertical scrolling and scroll horizontally instead
            // but only if it's over the container
            containerRef.current.scrollLeft += e.deltaY;
        }
    };

    const scrollNav = (direction: number) => {
        if (containerRef.current) {
            const scrollAmount = window.innerWidth < 640 ? 250 : 320;
            containerRef.current.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
        }
    };

    return (
        <section id="community" className="bg-brand-black overflow-hidden relative pb-16 sm:pb-20">
            {/* Background Image */}
            <Image
                src="/images/fondo-reels.png"
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
                className="absolute left-0 sm:left-2 top-1/2 mt-16 sm:mt-12 -translate-y-1/2 z-30 text-white/40 hover:text-white hover:scale-110 transition-all p-1"
                aria-label="Scroll left"
            >
                <ChevronLeft className="w-8 h-8 sm:w-12 sm:h-12 drop-shadow-md" strokeWidth={1} />
            </button>
            <button 
                onClick={() => scrollNav(1)} 
                className="absolute right-0 sm:right-2 top-1/2 mt-16 sm:mt-12 -translate-y-1/2 z-30 text-white/40 hover:text-white hover:scale-110 transition-all p-1"
                aria-label="Scroll right"
            >
                <ChevronRight className="w-8 h-8 sm:w-12 sm:h-12 drop-shadow-md" strokeWidth={1} />
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
                className="flex overflow-x-auto gap-4 sm:gap-6 px-4 md:px-8 pb-10 snap-x snap-mandatory no-scrollbar"
                style={{ WebkitOverflowScrolling: "touch" }}
            >
                {reels.map((reel) => (
                    <motion.div
                        key={reel.id}
                        variants={{
                            hidden: { opacity: 0, y: 50, filter: "blur(10px)" },
                            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
                        }}
                        className="relative flex-shrink-0 w-[240px] h-[420px] sm:w-[280px] sm:h-[500px] md:w-[320px] md:h-[580px] snap-center rounded-xl overflow-hidden group bg-black"
                    >
                        {reel.isEmbed ? (
                            <div className="absolute inset-0 overflow-hidden rounded-xl bg-black">
                                {/* Extra black safety overlays */}
                                <div className="absolute top-0 inset-x-0 h-16 sm:h-20 bg-black z-20 pointer-events-none" />
                                <div className="absolute bottom-0 inset-x-0 h-24 sm:h-28 bg-black z-20 pointer-events-none" />
                                <iframe
                                    src={`${reel.videoUrl}?autoplay=1`}
                                    className="absolute left-0 w-full border-none"
                                    style={{ height: "165%", top: "3%" }}
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
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-brand-red/90 backdrop-blur-md rounded-full flex items-center justify-center text-white pl-1 shadow-[0_0_20px_rgba(204,0,0,0.5)]">
                                        <Play size={24} fill="currentColor" className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                </div>

                                {/* Bottom Content */}
                                <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 text-white z-10 pointer-events-none">
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

                                {/* Video element (Placeholder for actual video handling logic if preferred) */}
                                <video
                                    src={reel.videoUrl}
                                    loop
                                    muted
                                    playsInline
                                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                                    onMouseLeave={(e) => {
                                        const video = e.target as HTMLVideoElement;
                                        video.pause();
                                        video.currentTime = 0;
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
