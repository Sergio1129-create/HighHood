"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    Package,
    Image as ImageIcon,
    BarChart3,
    Users,
    Menu,
    X,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SIDEBAR_FULL = 240;
const SIDEBAR_MINI = 72;
const DEFAULT_ADMIN_BG = "/images/fondo-admin.png";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("products");
    const [adminBg, setAdminBg] = useState(DEFAULT_ADMIN_BG);

    // Leer fondo del admin desde localStorage
    useEffect(() => {
        const saved = localStorage.getItem("hh_bg_admin");
        if (saved) setAdminBg(saved);

        // Escuchar cambios hechos desde la página de admin (sección Imágenes)
        const onBgChange = (e: Event) => {
            setAdminBg((e as CustomEvent<string>).detail);
        };
        window.addEventListener("admin:bgChange", onBgChange);
        return () => window.removeEventListener("admin:bgChange", onBgChange);
    }, []);

    const handleTabSwitch = (tabId: string) => {
        setActiveTab(tabId);
        window.dispatchEvent(new CustomEvent("admin:setTab", { detail: tabId }));
        if (mobileDrawerOpen) setMobileDrawerOpen(false);
    };

    // Orden: Productos → Métricas → Clientes → Imágenes (última)
    const sidebarItems = [
        { id: "products", label: "Productos", icon: <Package size={20} /> },
        { id: "metrics", label: "Métricas", icon: <BarChart3 size={20} /> },
        { id: "customers", label: "Clientes", icon: <Users size={20} /> },
        { id: "images", label: "Imágenes", icon: <ImageIcon size={20} /> },
    ];

    const sidebarW = sidebarOpen ? SIDEBAR_FULL : SIDEBAR_MINI;

    const NavItems = ({ compact }: { compact: boolean }) => (
        <nav className="flex-1 py-6 px-3 flex flex-col gap-1.5">
            {sidebarItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => handleTabSwitch(item.id)}
                    title={compact ? item.label : undefined}
                    className={`
                        flex items-center gap-4 w-full p-3 rounded-xl transition-all group relative
                        ${compact ? "justify-center" : ""}
                        ${activeTab === item.id
                            ? "bg-brand-red text-white shadow-lg shadow-brand-red/20"
                            : "text-white/50 hover:bg-white/5 hover:text-white"}
                    `}
                >
                    <div className="flex-shrink-0">{item.icon}</div>
                    {!compact && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                    {compact && (
                        <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#222] border border-white/5 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                            {item.label}
                        </div>
                    )}
                </button>
            ))}
        </nav>
    );

    return (
        <div className="min-h-screen bg-brand-black text-white font-sans selection:bg-brand-red selection:text-white">

            {/* ── Fondo global (sidebar, topbar) ─────────────────────────── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <Image src={adminBg} alt="" fill className="object-cover opacity-[0.03] invert" priority />
                <div className="absolute inset-0 bg-gradient-to-br from-brand-black/95 via-brand-black/98 to-brand-black" />
            </div>

            {/* ── MOBILE DRAWER ─────────────────────────────────────────────── */}
            <AnimatePresence>
                {mobileDrawerOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setMobileDrawerOpen(false)}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] lg:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.26, ease: "easeOut" }}
                            className="fixed top-0 left-0 bottom-0 w-64 z-[90] flex flex-col overflow-hidden lg:hidden"
                        >
                            <Image src={adminBg} fill alt="" className="object-cover opacity-20 mix-blend-overlay pointer-events-none" />
                            <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl pointer-events-none" />
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="h-14 flex items-center justify-between px-5 border-b border-white/5 flex-shrink-0">
                                    <div className="flex items-center gap-3">
                                        <Image src="/images/logo.png" alt="Logo" width={26} height={20} className="object-contain" />
                                        <span className="text-white font-heading tracking-[0.2em] text-xs">ADMIN</span>
                                    </div>
                                    <button onClick={() => setMobileDrawerOpen(false)} className="text-white/40 hover:text-white p-1 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <NavItems compact={false} />
                                <div className="p-4 border-t border-white/5 flex-shrink-0">
                                    <Link href="/" className="flex items-center gap-4 w-full p-3 rounded-xl text-white/50 hover:text-brand-red hover:bg-brand-red/10 transition-all">
                                        <LogOut size={20} />
                                        <span className="text-sm font-medium">Salir</span>
                                    </Link>
                                </div>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* ── DESKTOP SIDEBAR ───────────────────────────────────────────── */}
            <motion.aside
                animate={{ width: sidebarW }}
                transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
                className="hidden lg:flex fixed top-0 left-0 bottom-0 border-r border-white/5 z-[60] flex-col overflow-hidden"
            >
                <Image src={adminBg} fill alt="" className="object-cover opacity-20 mix-blend-overlay pointer-events-none" />
                <div className="absolute inset-0 bg-black/85 backdrop-blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col h-full">
                    <div className="h-16 flex items-center px-4 border-b border-white/5 justify-between flex-shrink-0 overflow-hidden">
                        {sidebarOpen ? (
                            <>
                                <div className="flex items-center gap-3">
                                    <Image src="/images/logo.png" alt="Logo" width={28} height={22} className="object-contain" />
                                    <span className="text-white font-heading tracking-[0.2em] text-xs whitespace-nowrap">ADMIN</span>
                                </div>
                                <button onClick={() => setSidebarOpen(false)} className="text-white/30 hover:text-white p-1 transition-colors flex-shrink-0">
                                    <ChevronLeft size={18} />
                                </button>
                            </>
                        ) : (
                            <button onClick={() => setSidebarOpen(true)} className="text-white/30 hover:text-white p-1 mx-auto transition-colors">
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                    <NavItems compact={!sidebarOpen} />
                    <div className="p-3 border-t border-white/5 flex-shrink-0">
                        <Link
                            href="/"
                            className={`flex items-center ${sidebarOpen ? "gap-4 px-3" : "justify-center"} w-full p-3 rounded-xl text-white/50 hover:text-brand-red hover:bg-brand-red/10 transition-all group relative`}
                        >
                            <LogOut size={20} className="flex-shrink-0" />
                            {sidebarOpen && <span className="text-sm font-medium whitespace-nowrap">Salir</span>}
                            {!sidebarOpen && (
                                <div className="absolute left-full ml-3 px-3 py-1.5 bg-[#222] border border-white/5 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">
                                    Salir del Admin
                                </div>
                            )}
                        </Link>
                    </div>
                </div>
            </motion.aside>

            {/* ── MOBILE TOP BAR ────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 z-50 flex items-center px-4 gap-4 lg:hidden">
                <button onClick={() => setMobileDrawerOpen(true)} className="text-white hover:text-brand-red transition-colors p-1 flex-shrink-0" aria-label="Abrir menú">
                    <Menu size={22} />
                </button>
                <div className="flex items-center gap-2.5">
                    <Image src="/images/logo.png" alt="Logo" width={22} height={16} className="object-contain" />
                    <span className="text-white font-heading tracking-[0.2em] text-xs">HIGHHOOD ADMIN</span>
                </div>
            </header>

            {/* ── MAIN CONTENT ──────────────────────────────────────────────── */}
            <motion.main
                animate={{ paddingLeft: sidebarW }}
                transition={{ type: "tween", duration: 0.22, ease: "easeInOut" }}
                className="
                    relative z-10
                    pt-14
                    lg:pt-0
                    max-lg:[padding-left:0_!important]
                "
            >
                {/* Fondo dinámico solo del área de contenido */}
                <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={adminBg}
                        alt=""
                        className="w-full h-full object-cover opacity-[0.08] transition-opacity duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-brand-black/92 to-black" />
                </div>
                <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                    {children}
                </div>
            </motion.main>
        </div>
    );
}
