"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Image as ImageIcon, BarChart3, Menu, X, LogOut, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("products");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        window.dispatchEvent(new CustomEvent("admin:search", { detail: e.target.value }));
    };

    // Helper to switch tabs via custom event
    const handleTabSwitch = (tabId: string) => {
        setActiveTab(tabId);
        window.dispatchEvent(new CustomEvent("admin:setTab", { detail: tabId }));
        if (mobileDrawerOpen) setMobileDrawerOpen(false);
    };

    const sidebarItems = [
        { id: "products", label: "Products", icon: <Package size={20} /> },
        { id: "images", label: "Images", icon: <ImageIcon size={20} /> },
        { id: "metrics", label: "Metrics", icon: <BarChart3 size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-brand-black text-brand-black font-sans relative flex selection:bg-brand-red selection:text-white">
            {/* Global Admin Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Image
                    src="/images/brands-bg.png"
                    alt="Brands Background"
                    fill
                    className="object-cover opacity-[0.03] invert"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-black/95 via-brand-black/98 to-brand-black z-0" />
            </div>

            {/* Global Header / Navbar (Persistent Search) */}
            <header className={`fixed top-0 right-0 h-16 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 z-50 flex items-center px-4 gap-3 md:gap-6 transition-all duration-300 ${sidebarOpen ? "left-0 lg:left-[240px]" : "left-0 lg:left-[80px]"}`}>
                
                {/* Mobile Hamburger & Logo */}
                <div className="flex items-center gap-2 md:gap-3 lg:hidden flex-shrink-0">
                    <button onClick={() => setMobileDrawerOpen(true)} className="text-white hover:text-brand-red transition-colors p-1">
                        <Menu size={24} />
                    </button>
                    <Image src="/images/logo.png" alt="Logo" width={24} height={18} className="object-contain" />
                </div>

                {/* Persistent Responsive Search Bar (Flex-Grow) */}
                <div className="flex-grow flex items-center max-w-2xl">
                    <div className="relative w-full">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar en admin..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full bg-white/10 hover:bg-white/15 border border-transparent text-white text-xs sm:text-sm rounded-full pl-9 pr-4 py-2 outline-none focus:border-brand-red focus:bg-white/20 transition-all placeholder-white/40"
                        />
                    </div>
                </div>

                {/* Desktop Identity */}
                <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                    <span className="text-white font-heading tracking-[0.2em] text-xs uppercase">HIGHHOOD ADMIN</span>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {mobileDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileDrawerOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="lg:hidden fixed top-0 left-0 bottom-0 w-64 border-r border-white/5 z-[70] shadow-2xl flex flex-col relative overflow-hidden"
                        >
                            {/* Mobile Sidebar Texture */}
                            <Image src="/images/brands-bg.png" fill className="object-cover opacity-20 z-0 pointer-events-none mix-blend-overlay" alt="" />
                            <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none" />

                            <div className="relative z-10 h-16 flex items-center justify-between px-4 border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <Image src="/images/logo.png" alt="Logo" width={28} height={20} className="object-contain" />
                                    <span className="text-white font-heading tracking-widest text-xs">ADMIN</span>
                                </div>
                                <button onClick={() => setMobileDrawerOpen(false)} className="text-white/50 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>
                            <nav className="relative z-10 flex-1 p-4 flex flex-col gap-2">
                                {sidebarItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleTabSwitch(item.id)}
                                        className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? "bg-brand-red text-white" : "text-white/60 hover:bg-white/5 hover:text-white"}`}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                            <div className="relative z-10 p-4 border-t border-white/5">
                                <Link href="/" className="flex items-center gap-3 px-4 py-3 w-full text-white/50 hover:text-white transition-colors text-sm font-medium hover:bg-white/5 rounded-lg">
                                    <LogOut size={20} />
                                    Exit Admin
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 240 : 80 }}
                className="hidden lg:flex fixed top-0 left-0 bottom-0 border-r border-white/5 z-[60] flex-col shadow-2xl relative overflow-hidden"
            >
                {/* Desktop Sidebar Texture */}
                <Image src="/images/brands-bg.png" fill className="object-cover opacity-20 z-0 pointer-events-none mix-blend-overlay" alt="" />
                <div className="absolute inset-0 bg-black/80 z-0 pointer-events-none backdrop-blur-3xl" />

                <div className="relative z-10 h-16 flex items-center px-6 border-b border-white/5 relative justify-between overflow-hidden">
                    <div className="flex items-center gap-3 min-w-max">
                        <Image src="/images/logo.png" alt="Logo" width={sidebarOpen ? 32 : 28} height={sidebarOpen ? 24 : 18} className="object-contain transition-all" />
                        {sidebarOpen && <span className="text-white font-heading tracking-[0.2em] text-xs">ADMIN</span>}
                    </div>
                </div>

                <nav className="relative z-10 flex-1 py-8 px-3 flex flex-col gap-2 overflow-hidden">
                    {sidebarItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => handleTabSwitch(item.id)}
                            className={`flex items-center gap-4 w-full p-3 rounded-xl transition-all group relative ${activeTab === item.id ? "bg-brand-red text-white shadow-lg shadow-brand-red/20" : "text-white/50 hover:bg-white/5 hover:text-white"}`}
                        >
                            <div className="flex-shrink-0">{item.icon}</div>
                            {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                            
                            {!sidebarOpen && (
                                <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#222] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="relative z-10 p-4 border-t border-white/5 flex flex-col gap-2">
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="flex items-center justify-center w-full p-2 rounded-lg text-white/30 hover:text-white transition-colors hover:bg-white/5"
                    >
                        {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                    <Link href="/" className={`flex items-center ${sidebarOpen ? "justify-start gap-4" : "justify-center"} w-full p-3 rounded-xl text-white/50 hover:text-white hover:bg-brand-red/20 hover:text-brand-red transition-all group relative`}>
                        <LogOut size={20} className="flex-shrink-0" />
                        {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">Exit</span>}
                        {!sidebarOpen && (
                            <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#222] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                Exit Admin
                            </div>
                        )}
                    </Link>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <main className={`flex-1 relative z-10 transition-all duration-300 pt-16 ${sidebarOpen ? "lg:ml-[240px]" : "lg:ml-[80px]"}`}>
                <div className="max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
