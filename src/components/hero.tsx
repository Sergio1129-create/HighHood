"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export default function HeroSection() {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section ref={ref} id="hero" className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-black">
            {/* Background Image with Parallax */}
            <motion.div style={{ y, opacity }} className="absolute inset-0 z-0">
                <Image
                    src="/images/fondo-hero.png"
                    alt="Urban Street Graffiti Background"
                    fill
                    className="object-cover object-center"
                    priority
                />
                <div className="absolute inset-0 bg-black/40" />
            </motion.div>

            <div className="relative z-10 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 text-center mt-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="mb-8 relative flex items-center justify-center"
                >
                    <Image
                        src="/images/logo.png"
                        alt="HIGHHOOD logo"
                        width={250}
                        height={200}
                        className="object-contain"
                        priority
                    />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <h1 className="font-heading text-5xl md:text-7xl lg:text-8xl text-white mb-6 tracking-wide drop-shadow-xl">
                        FROM THE <span className="text-brand-red">HOOD</span><br />
                        TO THE <span className="text-white">WORLD</span>
                    </h1>

                    <p className="text-white/80 text-lg md:text-xl font-medium tracking-widest uppercase mb-12 max-w-2xl mx-auto">
                        Premium streetwear culture. Oversized aesthetics.
                    </p>

                    <Link href="#shop">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-brand-red text-white px-8 py-4 text-sm md:text-base font-bold tracking-[0.2em] uppercase flex items-center gap-3 mx-auto hover:bg-white hover:text-brand-black transition-colors duration-300 shadow-[0_0_20px_rgba(204,0,0,0.4)]"
                        >
                            Shop The Drop
                            <ArrowRight size={20} />
                        </motion.button>
                    </Link>
                </motion.div>
            </div>

            {/* Bottom fade into Shop Section */}
            <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black to-transparent z-10 pointer-events-none" />

        </section>
    );
}
