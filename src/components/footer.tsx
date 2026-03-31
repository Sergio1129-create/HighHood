"use client";

import Image from "next/image";
import Link from "next/link";
import { Instagram, Facebook, Share2 } from "lucide-react"; // TikTok and Shopify icons aren't standard in lucide with exact logos, using text/placeholders
import { motion } from "framer-motion";

export default function Footer() {
    return (
        <footer
            className="bg-brand-black text-white pt-20 pb-10 relative overflow-hidden min-h-fit"
            style={{ boxShadow: "0 50vh 0 50vh #1A1A1A" }}
        >
            {/* Top fade from Features section */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-brand-black to-transparent z-10 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-8 pb-10 sm:pb-0">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: 0.05 } }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-16"
                >

                    {/* Brand Col */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
                        }}
                        className="col-span-1 lg:col-span-2"
                    >
                        <Link href="/" className="inline-block mb-6 relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                            <Image
                                src="/images/logo.png"
                                alt="HIGHHOOD Logo"
                                fill
                                className="object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                            />
                        </Link>
                        <p className="text-white/60 text-xs sm:text-sm max-w-xs sm:max-w-sm font-medium tracking-widest leading-relaxed mb-8 uppercase">
                            Premium streetwear from the hood to the world. Oversized cuts, raw aesthetics, and high quality garments.
                        </p>

                        {/* Socials */}
                        <div className="flex items-center gap-4">
                            <a
                                href="https://www.instagram.com/highhood_/"
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-brand-black transition-colors"
                            >
                                <Instagram size={18} />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-brand-black transition-colors"
                                title="TikTok Placeholder"
                            >
                                <span className="font-bold text-xs uppercase">TK</span>
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-brand-black transition-colors"
                            >
                                <Facebook size={18} />
                            </a>
                            <a
                                href="#"
                                className="w-10 h-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-brand-black transition-colors"
                                title="Shopify Placeholder"
                            >
                                <Share2 size={18} />
                            </a>
                        </div>

                        {/* DREON — Created by */}
                        <div className="mt-10 pt-8 border-t border-white/10">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-3">Created by</p>
                            <div className="flex items-center gap-3">
                                <div className="relative w-8 h-8 flex-shrink-0">
                                    <Image
                                        src="/images/dreon-logo.png"
                                        alt="DREON"
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="font-heading text-sm tracking-[0.2em] text-white/70">DREON</span>
                                <a
                                    href="https://www.instagram.com/dreon.club/"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="ml-1 w-7 h-7 border border-white/20 rounded-full flex items-center justify-center hover:bg-white hover:text-brand-black transition-colors text-white/50"
                                    aria-label="DREON en Instagram"
                                >
                                    <Instagram size={14} />
                                </a>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: "easeOut" } }
                        }}
                    >
                        <h4 className="font-heading text-xl text-brand-red mb-6 tracking-wider">Explore</h4>
                        <ul className="space-y-4">
                            {['New Arrivals', 'Best Sellers', 'Brands', 'Lookbook', 'Community'].map((link) => (
                                <li key={link}>
                                    <Link href="#" className="text-white/70 hover:text-white uppercase tracking-widest text-sm transition-colors">
                                        {link}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 40 },
                            show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
                        }}
                    >
                        <h4 className="font-heading text-xl text-brand-red mb-6 tracking-wider">Contact</h4>
                        <ul className="space-y-4 text-white/70 text-sm uppercase tracking-widest">
                            <li>
                                <span className="block text-white/40 mb-1 text-xs">WhatsApp</span>
                                <a href="https://wa.me/573214085305" className="hover:text-white transition-colors block">
                                    +57 321 408 5305
                                </a>
                            </li>
                            <li>
                                <span className="block text-white/40 mb-1 text-xs">Email</span>
                                <a href="mailto:info@highhood.com" className="hover:text-white transition-colors block">
                                    info@highhood.com
                                </a>
                            </li>
                            <li>
                                <span className="block text-white/40 mb-1 text-xs">Location</span>
                                <span>Bogotá, Colombia</span>
                            </li>
                        </ul>
                    </motion.div>

                </motion.div>

                {/* Bottom */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-4 text-center md:text-left text-white/40 text-[10px] sm:text-xs uppercase tracking-widest"
                >
                    <p>&copy; {new Date().getFullYear()} HIGHHOOD. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <span className="text-white/20">·</span>
                        <a
                            href="https://www.instagram.com/dreon.co/"
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 hover:text-white/60 transition-colors"
                        >
                            <div className="relative w-3.5 h-3.5">
                                <Image src="/images/dreon-logo.png" alt="DREON" fill className="object-contain opacity-60" />
                            </div>
                            Created by DREON
                        </a>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
