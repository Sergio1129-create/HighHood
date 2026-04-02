"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, Instagram, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { UserMenuButton } from "@/components/auth-modal";
import { getPublicBrands } from "@/actions/public-products";

const smoothScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
};

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [brandsOpen, setBrandsOpen] = useState(false);
    const [mobileBrandsOpen, setMobileBrandsOpen] = useState(false);
    const { totalItems, toggleCart } = useCart();
    const brandsRef = useRef<HTMLDivElement>(null);
    const [dbBrands, setDbBrands] = useState<any[]>([]);

    useEffect(() => {
        getPublicBrands().then(brands => setDbBrands(brands)).catch(console.error);
    }, []);

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

    // Close desktop dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (brandsRef.current && !brandsRef.current.contains(e.target as Node)) {
                setBrandsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleBrandClick = (brand: string) => {
        // Dispatch custom event that ShopSection will listen for
        window.dispatchEvent(new CustomEvent("highhood:setBrand", { detail: brand }));
        smoothScrollTo("shop");
        setBrandsOpen(false);
        setMobileMenuOpen(false);
        setMobileBrandsOpen(false);
    };

    const linkClasses = (scrolled: boolean) =>
        `text-sm font-medium uppercase tracking-wider lg:tracking-widest hover:text-brand-red transition-colors ${scrolled ? "text-brand-black" : "text-white/90"}`;

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? "bg-white/70 backdrop-blur-md shadow-sm py-3 md:py-4"
                    : "bg-transparent py-4 md:py-6"
                    }`}
            >
                <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                    <Link href="/" className="relative z-50 flex items-center gap-2 md:gap-3">
                        <Image
                            src="/images/logo.png"
                            alt="HIGHHOOD logo"
                            width={50}
                            height={33}
                            className="object-contain md:w-[60px] md:h-[40px]"
                            priority
                        />
                        <span
                            className={`font-heading text-xl sm:text-2xl md:text-3xl font-bold tracking-widest ${isScrolled ? "text-brand-black" : "text-white"
                                } transition-colors duration-300 drop-shadow-md`}
                        >
                            HIGHHOOD
                        </span>
                    </Link>

                    {/* Desktop Nav - Breakpoint changed to lg to prevent tablet overlap */}
                    <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
                        {/* Home */}
                        <button onClick={() => smoothScrollTo("hero")} className={linkClasses(isScrolled)}>Home</button>

                        {/* Shop → scrolls to #shop */}
                        <button onClick={() => smoothScrollTo("shop")} className={linkClasses(isScrolled)}>Shop</button>

                        {/* Brands → hover dropdown */}
                        <div
                            ref={brandsRef}
                            className="relative"
                            onMouseEnter={() => setBrandsOpen(true)}
                            onMouseLeave={() => setBrandsOpen(false)}
                        >
                            <button
                                onClick={() => setBrandsOpen(!brandsOpen)}
                                className={`${linkClasses(isScrolled)} flex items-center gap-1`}
                            >
                                Brands
                                <ChevronDown size={14} className={`transition-transform duration-200 ${brandsOpen ? "rotate-180" : ""}`} />
                            </button>

                            <AnimatePresence>
                                {brandsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl border border-black/5 overflow-hidden py-2 z-[999]"
                                    >
                                        {dbBrands.map((brand, i) => (
                                            <button
                                                key={`${brand.id || i}`}
                                                onClick={() => handleBrandClick(brand.name)}
                                                className="w-full text-left px-5 py-2.5 text-sm font-medium text-brand-black uppercase tracking-widest hover:bg-brand-red hover:text-white transition-colors duration-150"
                                            >
                                                {brand.name}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Drops → scrolls to #trending-now */}
                        <button onClick={() => smoothScrollTo("trending-now")} className={linkClasses(isScrolled)}>Drops</button>

                        {/* Community */}
                        <button onClick={() => smoothScrollTo("community")} className={linkClasses(isScrolled)}>Community</button>
                    </nav>

                    {/* Actions: User → Cart → Hamburger */}
                    <div className="flex items-center gap-3 sm:gap-4 relative z-50">
                        {/* User icon */}
                        <UserMenuButton />
                        {/* Cart */}
                        <button
                            onClick={toggleCart}
                            className={`${isScrolled ? "text-brand-black" : "text-white"} hover:text-brand-red transition-colors relative p-1`}
                        >
                            <ShoppingBag size={22} className="w-5 h-5 md:w-[22px] md:h-[22px]" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-2 bg-brand-red text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </button>
                        <button
                            className={`lg:hidden p-1 ${isScrolled || mobileMenuOpen ? "text-brand-black" : "text-white"}`}
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <X size={26} className="w-6 h-6 md:w-[26px] md:h-[26px]" /> : <Menu size={26} className="w-6 h-6 md:w-[26px] md:h-[26px]" />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: "-100%" }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: "-100%" }}
                        transition={{ type: "tween", duration: 0.3 }}
                        className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center pt-20 pb-10"
                    >
                        <nav className="flex flex-col items-center gap-5 md:gap-8 flex-1 justify-center w-full px-8">
                            <button onClick={() => { setMobileMenuOpen(false); smoothScrollTo("hero"); }} className="font-heading text-3xl sm:text-4xl text-brand-black hover:text-brand-red transition-colors uppercase tracking-widest">Home</button>
                            <button onClick={() => { setMobileMenuOpen(false); smoothScrollTo("shop"); }} className="font-heading text-3xl sm:text-4xl text-brand-black hover:text-brand-red transition-colors uppercase tracking-widest">Shop</button>

                            {/* Brands expandable on mobile */}
                            <div className="w-full flex flex-col items-center">
                                <button
                                    onClick={() => setMobileBrandsOpen(!mobileBrandsOpen)}
                                    className="font-heading text-3xl sm:text-4xl text-brand-black hover:text-brand-red transition-colors uppercase tracking-widest flex items-center gap-2"
                                >
                                    Brands
                                    <ChevronDown size={20} className={`transition-transform duration-200 ${mobileBrandsOpen ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                    {mobileBrandsOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden flex flex-col items-center gap-3 mt-3"
                                        >
                                            {dbBrands.map((brand, i) => (
                                                <button
                                                    key={`${brand.id || i}`}
                                                    onClick={() => handleBrandClick(brand.name)}
                                                    className="block w-full text-left px-5 py-3 text-sm font-medium tracking-wider hover:bg-neutral-100 hover:text-brand-red uppercase transition-colors"
                                                >
                                                    {brand.name}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button onClick={() => { setMobileMenuOpen(false); smoothScrollTo("trending-now"); }} className="font-heading text-3xl sm:text-4xl text-brand-black hover:text-brand-red transition-colors uppercase tracking-widest">Drops</button>
                            <button onClick={() => { setMobileMenuOpen(false); smoothScrollTo("community"); }} className="font-heading text-3xl sm:text-4xl text-brand-black hover:text-brand-red transition-colors uppercase tracking-widest">Community</button>
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    toggleCart();
                                }}
                                className="font-heading text-3xl sm:text-4xl text-brand-black hover:text-brand-red transition-colors uppercase tracking-widest"
                            >
                                CARRITO {totalItems > 0 && `(${totalItems})`}
                            </button>
                        </nav>

                        <div className="flex items-center gap-6 mt-auto">
                            <a href="https://www.instagram.com/highhood_/" target="_blank" rel="noreferrer" className="text-brand-black hover:text-brand-red transition-colors">
                                <Instagram size={24} />
                            </a>
                            <a href="#" className="font-bold text-brand-black hover:text-brand-red transition-colors tracking-widest">
                                TK
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
