"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X, Mail, ArrowLeft, Loader2, CheckCircle2, UserCircle2, ShoppingBag, LogOut, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

type Step = "email" | "otp" | "loading" | "success";

// ─── Portal wrapper: renders children at document.body level ─────────────────
// This bypasses any parent transform/filter stacking contexts (framer-motion
// animations on hero/shop sections) that break `position: fixed`.
function Portal({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
    if (!mounted) return null;
    return createPortal(children, document.body);
}

// ── OTP digit inputs ──────────────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

    const handleChange = (i: number, v: string) => {
        const digit = v.replace(/\D/g, "").slice(-1);
        const arr = [...digits];
        arr[i] = digit;
        onChange(arr.join(""));
        if (digit && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !digits[i] && i > 0) {
            inputRefs.current[i - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && i > 0) inputRefs.current[i - 1]?.focus();
        if (e.key === "ArrowRight" && i < 5) inputRefs.current[i + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length > 0) {
            onChange(pasted.padEnd(6, "").slice(0, 6));
            inputRefs.current[Math.min(pasted.length, 5)]?.focus();
        }
        e.preventDefault();
    };

    return (
        <div className="flex gap-2 justify-center" onPaste={handlePaste}>
            {Array.from({ length: 6 }, (_, i) => (
                <input
                    key={i}
                    ref={el => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i]}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-bold border-2 border-neutral-200 rounded-xl focus:outline-none focus:border-brand-black transition-all bg-white text-brand-black select-none"
                />
            ))}
        </div>
    );
}

// ── Auth Modal ────────────────────────────────────────────────────────────────
interface AuthModalProps { isOpen: boolean; onClose: () => void; }

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [step, setStep]             = useState<Step>("email");
    const [email, setEmail]           = useState("");
    const [otp, setOtp]               = useState("");
    const [error, setError]           = useState("");
    const [newsletter, setNewsletter] = useState(false);

    // Prevent body scroll while open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isOpen]);

    const supabase = createClient();

    const reset = () => {
        setStep("email"); setEmail(""); setOtp(""); setError("");
    };

    const handleClose = () => {
        onClose();
        setTimeout(reset, 350);
    };

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setError("");
        setStep("loading");
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: { shouldCreateUser: true, data: { newsletter } },
        });
        if (error) { setError(error.message); setStep("email"); return; }
        setStep("otp");
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.replace(/\s/g, "").length < 6) return;
        setError("");
        setStep("loading");
        const { error } = await supabase.auth.verifyOtp({
            email, token: otp, type: "email",
        });
        if (error) { setError("Código incorrecto o expirado."); setStep("otp"); return; }
        setStep("success");
        setTimeout(handleClose, 1800);
    };

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Backdrop ───────────────────────────────────────── */}
                    <motion.div
                        key="auth-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleClose}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9998,
                            background: "rgba(0,0,0,0.65)",
                            backdropFilter: "blur(6px)",
                            WebkitBackdropFilter: "blur(6px)",
                        }}
                    />

                    {/* ── Modal card ─────────────────────────────────────── */}
                    <motion.div
                        key="auth-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "1rem",
                            pointerEvents: "none",
                        }}
                    >
                        <div
                            style={{ pointerEvents: "auto" }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-sm relative overflow-hidden"
                        >
                            {/* Decorative top bar */}
                            <div className="h-1 w-full bg-gradient-to-r from-brand-red via-brand-black to-brand-red" />

                            <div className="p-7 sm:p-8">
                                {/* Close */}
                                <button
                                    onClick={handleClose}
                                    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center transition-colors"
                                >
                                    <X size={16} className="text-neutral-600" />
                                </button>

                                {/* Logo */}
                                <div className="flex justify-center mb-6">
                                    <div className="flex items-center gap-2.5">
                                        <Image src="/images/logo.png" alt="HIGHHOOD" width={34} height={26} className="object-contain" />
                                        <span className="font-heading text-lg tracking-[0.18em] text-brand-black border-t-[2.5px] border-brand-black pt-0.5">
                                            HIGHHOOD
                                        </span>
                                    </div>
                                </div>

                                <AnimatePresence mode="wait">

                                    {/* SUCCESS */}
                                    {step === "success" && (
                                        <motion.div key="s" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                            className="text-center py-6 flex flex-col items-center gap-4">
                                            <CheckCircle2 size={52} className="text-green-500" />
                                            <div>
                                                <h2 className="font-heading text-xl uppercase tracking-widest text-brand-black">¡Bienvenido!</h2>
                                                <p className="text-neutral-500 text-sm mt-1">Has iniciado sesión exitosamente.</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* LOADING */}
                                    {step === "loading" && (
                                        <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                            className="flex flex-col items-center gap-4 py-10">
                                            <Loader2 size={36} className="animate-spin text-brand-red" />
                                            <p className="text-sm text-neutral-500">Procesando...</p>
                                        </motion.div>
                                    )}

                                    {/* STEP 1: EMAIL */}
                                    {step === "email" && (
                                        <motion.div key="e" initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }}>
                                            <h2 className="text-[1.6rem] font-bold text-brand-black mb-1 leading-tight">Iniciar sesión</h2>
                                            <p className="text-sm text-neutral-500 mb-6">Inicia sesión o crea una cuenta</p>

                                            {error && (
                                                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4">{error}</p>
                                            )}

                                            <form onSubmit={handleSendOtp} className="space-y-3">
                                                <input
                                                    type="email" required autoComplete="email"
                                                    value={email} onChange={e => setEmail(e.target.value)}
                                                    placeholder="Correo electrónico"
                                                    className="w-full border border-neutral-200 rounded-xl px-4 py-3.5 text-sm text-brand-black placeholder-neutral-400 focus:outline-none focus:border-brand-black transition-all"
                                                />
                                                <button type="submit"
                                                    className="w-full bg-brand-black text-white font-semibold py-3.5 rounded-xl hover:bg-brand-red transition-colors text-sm tracking-wide shadow-sm">
                                                    Continuar
                                                </button>
                                            </form>

                                            <label className="flex items-start gap-3 mt-4 cursor-pointer">
                                                <input type="checkbox" checked={newsletter} onChange={e => setNewsletter(e.target.checked)}
                                                    className="mt-0.5 w-4 h-4 accent-brand-red rounded flex-shrink-0" />
                                                <span className="text-xs text-neutral-500 leading-relaxed">
                                                    Envíarme novedades y ofertas por correo, WhatsApp o SMS.
                                                </span>
                                            </label>

                                            <p className="text-center text-xs text-neutral-400 mt-4">
                                                Si continúas, aceptas nuestros{" "}
                                                <a href="#" className="underline underline-offset-2 hover:text-brand-red transition-colors">
                                                    Términos del servicio
                                                </a>
                                            </p>
                                        </motion.div>
                                    )}

                                    {/* STEP 2: OTP */}
                                    {step === "otp" && (
                                        <motion.div key="o" initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}>
                                            <button
                                                onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                                                className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-brand-black transition-colors mb-5"
                                            >
                                                <ArrowLeft size={14} /> Volver
                                            </button>

                                            <h2 className="text-[1.6rem] font-bold text-brand-black mb-1 leading-tight">Introducir código</h2>
                                            <p className="text-sm text-neutral-500 mb-6">
                                                Enviado a{" "}
                                                <span className="font-semibold text-brand-black">{email}</span>
                                            </p>

                                            {error && (
                                                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 mb-4">{error}</p>
                                            )}

                                            <form onSubmit={handleVerifyOtp} className="space-y-5">
                                                <OtpInput value={otp} onChange={setOtp} />
                                                <button
                                                    type="submit"
                                                    disabled={otp.replace(/\s/g, "").length < 6}
                                                    className="w-full bg-brand-black text-white font-semibold py-3.5 rounded-xl hover:bg-brand-red transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    Enviar
                                                </button>
                                            </form>

                                            <button
                                                onClick={() => { setStep("email"); setOtp(""); setError(""); }}
                                                className="block w-full text-center text-sm text-neutral-400 hover:text-brand-black mt-5 transition-colors"
                                            >
                                                Iniciar sesión con otro correo electrónico
                                            </button>
                                        </motion.div>
                                    )}

                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );

    // Render via portal so fixed positioning is always relative to viewport,
    // regardless of parent transform/filter stacking contexts.
    return <Portal>{modalContent}</Portal>;
}

// ── User menu button ──────────────────────────────────────────────────────────
export function UserMenuButton() {
    const { user, loading, signOut } = useAuth();
    const [modalOpen, setModalOpen]   = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (loading) return (
        <div className="w-6 h-6 rounded-full bg-white/20 animate-pulse" />
    );

    // ── Not logged in ──────────────────────────────────────────────────────────
    if (!user) return (
        <>
            <button
                onClick={() => setModalOpen(true)}
                aria-label="Iniciar sesión"
                className="text-white hover:text-brand-red transition-colors p-1"
            >
                <UserCircle2 size={22} className="w-5 h-5 md:w-[22px] md:h-[22px]" />
            </button>
            <AuthModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
        </>
    );

    // ── Logged in ──────────────────────────────────────────────────────────────
    const initial = user.email?.charAt(0).toUpperCase() ?? "U";
    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-1.5 text-white hover:text-brand-red transition-colors p-1"
            >
                <div className="w-7 h-7 rounded-full bg-brand-red flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2 ring-white/20">
                    {initial}
                </div>
                <ChevronDown size={13} className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
                {dropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.14 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden py-2"
                        style={{ zIndex: 9999 }}
                    >
                        <div className="px-4 py-2.5 border-b border-neutral-100">
                            <p className="text-[11px] text-neutral-400 uppercase tracking-widest">Cuenta</p>
                            <p className="text-xs font-bold text-brand-black truncate mt-0.5">{user.email}</p>
                        </div>
                        <button
                            onClick={() => { setDropdownOpen(false); router.push("/cuenta"); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-brand-black transition-colors"
                        >
                            <ShoppingBag size={16} className="text-neutral-400" /> Mi cuenta
                        </button>
                        <button
                            onClick={() => { setDropdownOpen(false); signOut(); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-brand-red transition-colors"
                        >
                            <LogOut size={16} className="text-neutral-400" /> Cerrar sesión
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
