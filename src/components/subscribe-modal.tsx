"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Mail, User, Phone, Calendar, ChevronDown, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

// ── tiny input helper ──────────────────────────────────────────────────────
const inputCls =
    "w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all backdrop-blur-sm";
const labelCls = "block text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1.5";

type Step = "form" | "loading" | "success";

interface SubscribeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SubscribeModal({ isOpen, onClose }: SubscribeModalProps) {
    const [step, setStep] = useState<Step>("form");
    const [error, setError] = useState("");
    const [form, setForm] = useState({
        firstName: "", lastName: "", docNumber: "",
        email: "", phone: "",
        bDay: "", bMonth: "", bYear: "",
        gender: "",
    });

    const set = (k: keyof typeof form) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            setForm(f => ({ ...f, [k]: e.target.value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setStep("loading");

        try {
            const supabase = createClient();

            // Registrar con contraseña temporal (el usuario recibirá link de confirmación)
            const tempPassword = `HH_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: form.email,
                password: tempPassword,
                options: {
                    data: {
                        first_name:  form.firstName,
                        last_name:   form.lastName,
                        doc_number:  form.docNumber,
                        phone:       form.phone,
                        birthday:    `${form.bYear}-${form.bMonth.padStart(2,"0")}-${form.bDay.padStart(2,"0")}`,
                        gender:      form.gender,
                        role:        "customer",
                        subscribed:  true,
                    },
                },
            });

            if (signUpError) {
                // "User already registered" → still show success (idempotent)
                if (signUpError.message.includes("already registered")) {
                    setStep("success");
                    return;
                }
                throw signUpError;
            }

            // If no error, insert into subscribers table (best-effort)
            if (data.user) {
                await supabase.from("subscribers").upsert({
                    user_id:    data.user.id,
                    email:      form.email,
                    first_name: form.firstName,
                    last_name:  form.lastName,
                    phone:      form.phone,
                    gender:     form.gender,
                    birthday:   `${form.bYear}-${form.bMonth.padStart(2,"0")}-${form.bDay.padStart(2,"0")}`,
                }, { onConflict: "email" });
            }

            setStep("success");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Error desconocido";
            setError(msg);
            setStep("form");
        }
    };

    // Reset on close
    const handleClose = () => {
        onClose();
        setTimeout(() => { setStep("form"); setError(""); }, 400);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 z-[200] bg-black/75 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="relative w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl pointer-events-auto flex">

                            {/* ── LEFT: Imagen de fondo ───────────────────── */}
                            <div className="hidden md:block relative w-[45%] flex-shrink-0 overflow-hidden">
                                <Image
                                    src="/images/fondo-admin.png"
                                    alt="HIGHHOOD"
                                    fill
                                    className="object-cover object-center"
                                    priority
                                />
                                {/* Overlay oscuro con branding */}
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                                <div className="absolute bottom-8 left-7 right-4">
                                    <p className="font-heading text-3xl text-white uppercase leading-tight tracking-[0.15em] drop-shadow-lg">
                                        FROM THE<br />HOOD TO<br />THE WORLD
                                    </p>
                                </div>
                                {/* Logo esquina */}
                                <div className="absolute top-6 left-6 flex items-center gap-2">
                                    <Image src="/images/logo.png" alt="HIGHHOOD" width={28} height={20} className="object-contain brightness-0 invert" />
                                    <span className="font-heading text-white text-sm tracking-[0.2em]">HIGHHOOD</span>
                                </div>
                            </div>

                            {/* ── RIGHT: Form ─────────────────────────────── */}
                            <div className="flex-1 relative overflow-y-auto">
                                {/* Form background con la imagen difuminada */}
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src="/images/fondo-admin.png"
                                        alt=""
                                        fill
                                        className="object-cover object-center scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
                                </div>

                                {/* Close button */}
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>

                                {/* Content */}
                                <div className="relative z-10 p-7 sm:p-9">

                                    {/* SUCCESS state */}
                                    <AnimatePresence mode="wait">
                                        {step === "success" ? (
                                            <motion.div
                                                key="success"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex flex-col items-center justify-center py-12 text-center gap-5"
                                            >
                                                <CheckCircle2 size={56} className="text-green-400" />
                                                <div>
                                                    <h2 className="font-heading text-2xl text-white uppercase tracking-widest">¡Bienvenido!</h2>
                                                    <p className="text-white/60 text-sm mt-2">
                                                        Tu registro fue exitoso. Revisa tu correo para confirmar tu cuenta y recibir ofertas exclusivas.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleClose}
                                                    className="mt-2 bg-brand-red text-white font-heading uppercase tracking-widest text-sm px-8 py-3.5 rounded-xl hover:bg-brand-red/80 transition-colors"
                                                >
                                                    Cerrar
                                                </button>
                                            </motion.div>
                                        ) : (
                                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                                {/* Header */}
                                                <div className="mb-7">
                                                    <h2 className="font-heading text-2xl sm:text-3xl text-white uppercase tracking-widest leading-tight">
                                                        Let&apos;s keep<br />in touch
                                                    </h2>
                                                    <p className="text-white/50 text-sm mt-1.5">
                                                        Completa para <span className="text-brand-red font-semibold">suscribirte</span> y obtener acceso exclusivo.
                                                    </p>
                                                </div>

                                                {error && (
                                                    <div className="mb-4 bg-red-500/20 border border-red-500/30 text-red-300 text-xs rounded-xl px-4 py-3">
                                                        {error}
                                                    </div>
                                                )}

                                                <form onSubmit={handleSubmit} className="space-y-3.5">
                                                    {/* Name row */}
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className={labelCls}>Nombres</label>
                                                            <input required value={form.firstName} onChange={set("firstName")} placeholder="Nombres" className={inputCls} />
                                                        </div>
                                                        <div>
                                                            <label className={labelCls}>Apellidos</label>
                                                            <input required value={form.lastName} onChange={set("lastName")} placeholder="Apellidos" className={inputCls} />
                                                        </div>
                                                    </div>

                                                    {/* ID */}
                                                    <div>
                                                        <label className={labelCls}>Número de Identificación</label>
                                                        <div className="relative">
                                                            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                                            <input value={form.docNumber} onChange={set("docNumber")} placeholder="Número de identificación" className={inputCls + " pl-10"} />
                                                        </div>
                                                    </div>

                                                    {/* Email */}
                                                    <div>
                                                        <label className={labelCls}>Correo electrónico *</label>
                                                        <div className="relative">
                                                            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                                            <input required type="email" value={form.email} onChange={set("email")} placeholder="correo@ejemplo.com" className={inputCls + " pl-10"} />
                                                        </div>
                                                    </div>

                                                    {/* Phone */}
                                                    <div>
                                                        <label className={labelCls}>Celular</label>
                                                        <div className="flex gap-2">
                                                            <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 text-white text-sm flex-shrink-0">
                                                                <span>🇨🇴</span>
                                                                <span className="text-white/60">+57</span>
                                                            </div>
                                                            <div className="relative flex-1">
                                                                <Phone size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                                                                <input type="tel" value={form.phone} onChange={set("phone")} placeholder="Celular" className={inputCls + " pl-10"} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Birthday */}
                                                    <div>
                                                        <label className={labelCls + " flex items-center gap-1.5"}>
                                                            <Calendar size={11} /> Cumpleaños
                                                        </label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <input value={form.bDay} onChange={set("bDay")} placeholder="DD" maxLength={2} className={inputCls + " text-center"} />
                                                            <input value={form.bMonth} onChange={set("bMonth")} placeholder="MM" maxLength={2} className={inputCls + " text-center"} />
                                                            <input value={form.bYear} onChange={set("bYear")} placeholder="YYYY" maxLength={4} className={inputCls + " text-center"} />
                                                        </div>
                                                    </div>

                                                    {/* Gender */}
                                                    <div>
                                                        <label className={labelCls}>Género</label>
                                                        <div className="relative">
                                                            <select value={form.gender} onChange={set("gender")} className={inputCls + " pr-10 appearance-none"}>
                                                                <option value="" disabled>Selecciona</option>
                                                                <option value="masculino">Masculino</option>
                                                                <option value="femenino">Femenino</option>
                                                                <option value="no_binario">No binario</option>
                                                                <option value="prefiero_no_decir">Prefiero no decir</option>
                                                            </select>
                                                            <ChevronDown size={15} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                                                        </div>
                                                    </div>

                                                    {/* Submit */}
                                                    <button
                                                        type="submit"
                                                        disabled={step === "loading"}
                                                        className="w-full mt-2 py-4 bg-brand-red text-white font-heading uppercase tracking-[0.2em] text-sm rounded-xl hover:bg-brand-red/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-red/20 disabled:opacity-60"
                                                    >
                                                        {step === "loading" ? (
                                                            <><Loader2 size={16} className="animate-spin" /> Registrando...</>
                                                        ) : "Enviar"}
                                                    </button>

                                                    <p className="text-[10px] text-white/30 text-center pt-1">
                                                        Al suscribirte aceptas nuestra política de privacidad. Podrás darte de baja en cualquier momento.
                                                    </p>
                                                </form>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ── Floating subscribe button ─────────────────────────────────────────────────
export function SubscribeButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating pill button — fixed bottom-right */}
            <motion.button
                onClick={() => setIsOpen(true)}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="
                    fixed bottom-6 right-6 z-[150]
                    bg-brand-red text-white
                    font-heading uppercase tracking-[0.18em] text-xs sm:text-sm
                    px-5 py-3 sm:px-6 sm:py-3.5
                    rounded-xl
                    shadow-xl shadow-brand-red/30
                    hover:bg-brand-black transition-colors
                    flex items-center gap-2
                    border border-brand-red/0 hover:border-brand-red
                "
                aria-label="Abrrir modal de suscripción"
            >
                <Mail size={15} />
                Suscríbete
            </motion.button>

            <SubscribeModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}
