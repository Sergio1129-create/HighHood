"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/utils/supabase/client";
import { ShoppingBag, User, MapPin, Plus, Edit2, LogOut, ChevronRight, Package } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "orders" | "profile";

interface Profile {
    full_name: string;
    email: string;
    phone: string;
}

interface Address {
    id: string;
    label: string;
    address: string;
    city: string;
    department: string;
    is_default: boolean;
}

export default function CuentaPage() {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const [tab, setTab] = useState<Tab>("orders");
    const [profile, setProfile] = useState<Profile | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [editingName, setEditingName] = useState(false);
    const [newName, setNewName] = useState("");
    const [saving, setSaving] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!loading && !user) router.push("/");
    }, [user, loading, router]);

    // Load profile
    useEffect(() => {
        if (!user) return;
        const supabase = createClient();

        supabase.from("customer_profiles")
            .select("*").eq("id", user.id).single()
            .then(({ data }) => {
                if (data) { setProfile(data); setNewName(data.full_name || ""); }
                else { setProfile({ full_name: "", email: user.email ?? "", phone: "" }); }
            });

        supabase.from("customer_addresses")
            .select("*").eq("customer_id", user.id).order("is_default", { ascending: false })
            .then(({ data }) => setAddresses(data ?? []));
    }, [user]);

    const saveName = async () => {
        if (!user) return;
        setSaving(true);
        const supabase = createClient();
        await supabase.from("customer_profiles").upsert({ id: user.id, email: user.email!, full_name: newName });
        setProfile(p => p ? { ...p, full_name: newName } : null);
        setSaving(false);
        setEditingName(false);
    };

    if (loading || !user) return (
        <div className="min-h-screen bg-[#f0f0f0] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f0f0f0] font-sans text-brand-black">

            {/* ── HEADER ──────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <Image src="/images/logo.png" alt="HIGHHOOD" width={32} height={24} className="object-contain" />
                        <span className="font-heading text-lg tracking-widest text-brand-black border-t-2 border-brand-black pt-0.5">HIGHHOOD</span>
                    </Link>

                    {/* Tabs */}
                    <nav className="flex items-center gap-6 sm:gap-8">
                        {([
                            { id: "orders",  label: "Pedidos",  icon: <Package size={15} /> },
                            { id: "profile", label: "Perfil",   icon: <User size={15} /> },
                        ] as const).map(t => (
                            <button key={t.id} onClick={() => setTab(t.id)}
                                className={`flex items-center gap-1.5 text-sm font-medium pb-0.5 transition-all border-b-2
                                    ${tab === t.id ? "border-brand-black text-brand-black" : "border-transparent text-neutral-400 hover:text-neutral-600"}`}>
                                {t.icon} {t.label}
                            </button>
                        ))}
                    </nav>

                    {/* User avatar + signout */}
                    <button onClick={() => { signOut(); router.push("/"); }}
                        className="flex items-center gap-2 text-sm text-neutral-400 hover:text-brand-red transition-colors group">
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-600 text-xs font-bold group-hover:bg-brand-red group-hover:text-white transition-colors">
                            {user.email?.charAt(0).toUpperCase()}
                        </div>
                        <LogOut size={15} className="hidden sm:block" />
                    </button>
                </div>
            </header>

            {/* ── CONTENT ──────────────────────────────────────────────────── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

                {/* ── PEDIDOS ── */}
                {tab === "orders" && (
                    <motion.div key="orders" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-2xl font-bold text-brand-black mb-6">Pedidos</h1>
                        <div className="bg-white rounded-2xl border border-neutral-200 p-12 flex flex-col items-center justify-center text-center gap-3 shadow-sm">
                            <ShoppingBag size={40} className="text-neutral-200" />
                            <div>
                                <p className="font-semibold text-brand-black">Aún no tienes ningún pedido</p>
                                <p className="text-sm text-neutral-400 mt-1">Ve a la tienda para realizar un pedido.</p>
                            </div>
                            <Link href="/#shop"
                                className="mt-2 flex items-center gap-2 text-sm font-semibold text-brand-black hover:text-brand-red transition-colors">
                                Ir a la tienda <ChevronRight size={16} />
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* ── PERFIL ── */}
                {tab === "profile" && (
                    <motion.div key="profile" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                        <h1 className="text-2xl font-bold text-brand-black mb-6">Perfil</h1>

                        {/* Info card */}
                        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                            {/* Name row */}
                            <div className="px-6 py-5 border-b border-neutral-100">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Nombre</span>
                                    <button onClick={() => setEditingName(!editingName)}
                                        className="text-neutral-400 hover:text-brand-black transition-colors p-1">
                                        <Edit2 size={14} />
                                    </button>
                                </div>
                                {editingName ? (
                                    <div className="flex gap-2 mt-2">
                                        <input value={newName} onChange={e => setNewName(e.target.value)}
                                            placeholder="Tu nombre completo"
                                            className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-brand-black transition-all" />
                                        <button onClick={saveName} disabled={saving}
                                            className="bg-brand-black text-white text-sm px-5 py-2.5 rounded-xl hover:bg-brand-red transition-colors disabled:opacity-50">
                                            {saving ? "..." : "Guardar"}
                                        </button>
                                        <button onClick={() => setEditingName(false)}
                                            className="text-sm px-4 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors">
                                            Cancelar
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-sm text-brand-black mt-0.5">
                                        {profile?.full_name || <span className="text-neutral-300 italic">Sin nombre</span>}
                                    </p>
                                )}
                            </div>

                            {/* Email row */}
                            <div className="px-6 py-5">
                                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400 block mb-1">Correo electrónico</span>
                                <p className="text-sm text-brand-black">{user.email}</p>
                            </div>
                        </div>

                        {/* Addresses card */}
                        <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-sm">
                            <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between">
                                <span className="font-semibold text-sm flex items-center gap-2">
                                    <MapPin size={16} className="text-neutral-400" /> Direcciones
                                </span>
                                <button className="flex items-center gap-1.5 text-xs font-semibold text-brand-black hover:text-brand-red transition-colors">
                                    <Plus size={14} /> Agregar
                                </button>
                            </div>
                            {addresses.length === 0 ? (
                                <div className="px-6 py-6 flex items-center gap-3 bg-neutral-50 mx-4 my-4 rounded-xl border border-neutral-100">
                                    <MapPin size={16} className="text-neutral-300" />
                                    <p className="text-sm text-neutral-400">No se agregaron direcciones.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-100">
                                    {addresses.map(addr => (
                                        <div key={addr.id} className="px-6 py-4 flex items-start justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-brand-black">{addr.label}</p>
                                                <p className="text-xs text-neutral-500 mt-0.5">{addr.address}, {addr.city}, {addr.department}</p>
                                                {addr.is_default && <span className="text-[10px] bg-brand-red/10 text-brand-red px-2 py-0.5 rounded-full font-bold mt-1 inline-block">Principal</span>}
                                            </div>
                                            <button className="text-neutral-300 hover:text-brand-red p-1 transition-colors"><Edit2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
