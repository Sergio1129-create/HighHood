"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navLinks = [
        { name: "Home", href: "#hero" },
        { name: "Shop", href: "#shop" },
        { name: "Brands", href: "#shop" },
        { name: "Drops", href: "#drops" },
        { name: "Community", href: "#community" },
    ];

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/70 backdrop-blur-md shadow-sm py-4"
                    : "bg-transparent py-6"
                    }`}
            >
                <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                    <Link href="/" className="relative z-50 flex items-center gap-3">
                        <Image
                            src="/images/logo.png"
                            alt="HIGHHOOD logo"
                            width={60}
                            height={40}
                            className="object-contain"
                            priority
                        />
                        <span
                            className={`font-heading text-3xl font-bold tracking-widest ${isScrolled ? "text-brand-black" : "text-white"
                                } transition-colors duration-300 drop-shadow-md`}
                        >
                            HIGHHOOD
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`text-sm font-medium uppercase tracking-widest hover:text-brand-red transition-colors ${isScrolled ? "text-brand-black" : "text-white/90"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4 relative z-50">
                        <button className={`${isScrolled ? "text-brand-black" : "text-white"} hover:text-brand-red transition-colors`}>
                            <Search size={22} />
                        </button>
                        <button className={`${isScrolled ? "text-brand-black" : "text-white"} hover:text-brand-red transition-colors relative`}>
                            <ShoppingBag size={22} />
                            <span className="absolute -top-1 -right-2 bg-brand-red text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                2
                            </span>
                        </button>
                        <button
                            className={`md:hidden ${isScrolled || mobileMenuOpen ? "text-brand-black" : "text-white"}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center"
                    >
                        <nav className="flex flex-col items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="font-heading text-4xl text-brand-black hover:text-brand-red transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
