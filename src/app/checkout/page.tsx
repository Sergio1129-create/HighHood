"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";
import {
    ShoppingBag, ChevronRight, ChevronDown, Tag, Truck,
    Store, Shield, CreditCard, Lock, ChevronUp, Info,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => `$ ${n.toLocaleString("es-CO", { minimumFractionDigits: 2 })}`;

const inputCls =
    "w-full border border-neutral-200 rounded-lg px-4 py-3.5 text-sm text-brand-black placeholder-neutral-400 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all bg-white";
const labelFloatCls =
    "block text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-1";

const COL_DEPARTMENTS = [
    "Amazonas","Antioquia","Arauca","Atlántico","Bogotá D.C.","Bolívar","Boyacá",
    "Caldas","Caquetá","Casanare","Cauca","Cesar","Chocó","Córdoba","Cundinamarca",
    "Guainía","Guaviare","Huila","La Guajira","Magdalena","Meta","Nariño",
    "Norte de Santander","Putumayo","Quindío","Risaralda","San Andrés y Providencia",
    "Santander","Sucre","Tolima","Valle del Cauca","Vaupés","Vichada",
];

const PAYMENT_METHODS = [
    { id: "card",        label: "Tarjeta de crédito / débito", logos: ["VISA","MC","AMEX"] },
    { id: "pse",         label: "PSE – Débito bancario" },
    { id: "mercadopago", label: "Mercado Pago" },
    { id: "nequi",       label: "Nequi" },
];

export default function CheckoutPage() {
    const { items, totalPrice, totalItems, clearCart } = useCart();
    const router = useRouter();

    // ── UI state ──────────────────────────────────────────────────────────────
    const [deliveryMode, setDeliveryMode] = useState<"ship" | "pickup">("ship");
    const [paymentMethod, setPaymentMethod] = useState("card");
    const [summaryOpen, setSummaryOpen] = useState(false); // mobile collapse
    const [discountCode, setDiscountCode] = useState("");
    const [discountApplied, setDiscountApplied] = useState(false);
    const [placing, setPlacing] = useState(false);
    const [step, setStep] = useState<"form" | "success">("form");

    // ── Form state ────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        email: "", newsletter: false, docType: "cedula",
        name: "", lastName: "", docNumber: "", address: "",
        apt: "", city: "", department: "Cundinamarca", postal: "", phone: "",
        birthday: { year: "", month: "", day: "" },
        saveInfo: false,
        // card
        cardNumber: "", cardExpiry: "", cardCvv: "", cardHolder: "",
        cardDocType: "cc", cardDocNumber: "", installments: "1",
        billingIsSameAsShipping: true,
    });
    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setForm(f => ({ ...f, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

    // Shipping cost
    const shippingFree = totalPrice >= 150000;
    const shippingCost = shippingFree ? 0 : 15000;
    const discount = discountApplied ? Math.round(totalPrice * 0.1) : 0;
    const grandTotal = totalPrice + shippingCost - discount;
    const taxIncluded = Math.round(grandTotal * 0.159);

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setPlacing(true);
        await new Promise(r => setTimeout(r, 1800));
        clearCart();
        setStep("success");
        setPlacing(false);
    };

    // ── SUCCESS screen ────────────────────────────────────────────────────────
    if (step === "success") {
        return (
            <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center px-4 py-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <h1 className="font-heading text-2xl uppercase tracking-widest text-brand-black mb-2">¡Pedido Confirmado!</h1>
                    <p className="text-neutral-500 text-sm mb-8">Recibirás un correo con los detalles de tu pedido. ¡Gracias por tu compra en HIGHHOOD!</p>
                    <Link href="/" className="inline-block bg-brand-black text-white font-heading uppercase tracking-widest text-sm px-8 py-4 rounded-xl hover:bg-brand-red transition-colors">
                        Volver al inicio
                    </Link>
                </motion.div>
            </div>
        );
    }

    // ── EMPTY CART ────────────────────────────────────────────────────────────
    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center gap-6 px-4">
                <ShoppingBag size={48} className="text-neutral-300" />
                <div className="text-center">
                    <h1 className="font-heading text-2xl uppercase tracking-widest text-brand-black mb-2">Tu carrito está vacío</h1>
                    <p className="text-neutral-500 text-sm">Agrega productos antes de hacer checkout.</p>
                </div>
                <Link href="/" className="bg-brand-red text-white font-heading uppercase tracking-widest text-sm px-8 py-4 rounded-xl hover:bg-brand-red/90 transition-colors shadow-lg">
                    Ver productos
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f5] font-sans text-brand-black">

            {/* ── HEADER ────────────────────────────────────────────────────── */}
            <header className="bg-white border-b border-neutral-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <Image src="/images/logo.png" alt="HIGHHOOD" width={36} height={26} className="object-contain" />
                        <span className="font-heading text-xl tracking-widest text-brand-black group-hover:text-brand-red transition-colors">
                            HIGHHOOD
                        </span>
                    </Link>
                    {/* Breadcrumb */}
                    <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 font-medium uppercase tracking-widest">
                        <span className="text-neutral-300">Carrito</span>
                        <ChevronRight size={12} />
                        <span className="text-brand-black">Información</span>
                        <ChevronRight size={12} />
                        <span className="text-neutral-300">Pago</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-500">
                        <Lock size={14} className="text-neutral-400" />
                        <span className="hidden sm:inline text-xs uppercase tracking-widest">Pago seguro</span>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_440px] gap-8 xl:gap-12 items-start">

                    {/* ════════════════════════════════════════════════════════
                        LEFT — FORM
                    ════════════════════════════════════════════════════════ */}
                    <form onSubmit={handlePlaceOrder} className="space-y-6 order-2 lg:order-1">

                        {/* Mobile: collapsible order summary */}
                        <div className="lg:hidden bg-white rounded-2xl border border-neutral-100 overflow-hidden shadow-sm">
                            <button
                                type="button"
                                onClick={() => setSummaryOpen(!summaryOpen)}
                                className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold"
                            >
                                <span className="flex items-center gap-2 text-brand-red">
                                    <ShoppingBag size={16} />
                                    Ver resumen del pedido ({totalItems} {totalItems === 1 ? "artículo" : "artículos"})
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className="font-heading text-base">{fmt(grandTotal)}</span>
                                    {summaryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>
                            <AnimatePresence>
                                {summaryOpen && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden border-t border-neutral-100"
                                    >
                                        <OrderSummary items={items} totalPrice={totalPrice} shippingCost={shippingCost} discount={discount} grandTotal={grandTotal} taxIncluded={taxIncluded} discountCode={discountCode} setDiscountCode={setDiscountCode} discountApplied={discountApplied} setDiscountApplied={setDiscountApplied} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ── CONTACTO ──────────────────────────────────── */}
                        <Section title="Contacto" action={<button type="button" className="text-xs text-brand-red underline underline-offset-2 font-medium">Iniciar sesión</button>}>
                            <input id="email" type="email" required value={form.email} onChange={set("email")} placeholder="Correo electrónico" className={inputCls} />
                            <label className="flex items-start gap-3 cursor-pointer mt-1">
                                <input type="checkbox" checked={form.newsletter} onChange={set("newsletter")} className="mt-0.5 w-4 h-4 accent-brand-red rounded flex-shrink-0" />
                                <span className="text-sm text-neutral-500">Envíame novedades y ofertas por correo electrónico, WhatsApp o SMS.</span>
                            </label>
                            <div className="mt-2">
                                <label className={labelFloatCls}>Tipo de Documento</label>
                                <div className="relative">
                                    <select value={form.docType} onChange={set("docType")} className={inputCls + " pr-10 appearance-none"}>
                                        <option value="cedula">Cédula de ciudadanía</option>
                                        <option value="pasaporte">Pasaporte</option>
                                        <option value="nit">NIT</option>
                                        <option value="extranjeria">Cédula de extranjería</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                </div>
                            </div>
                        </Section>

                        {/* ── ENTREGA ───────────────────────────────────── */}
                        <Section title="Entrega">
                            {/* Toggle Ship / Pickup */}
                            <div className="grid grid-cols-2 gap-3">
                                {([
                                    { id: "ship",   label: "Envío",             icon: <Truck size={20} /> },
                                    { id: "pickup", label: "Recogida en bodega", icon: <Store size={20} /> },
                                ] as const).map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setDeliveryMode(opt.id)}
                                        className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all text-sm font-medium
                                            ${deliveryMode === opt.id
                                                ? "border-brand-black bg-white shadow-sm text-brand-black"
                                                : "border-neutral-200 text-neutral-400 hover:border-neutral-300 bg-white"
                                            }`}
                                    >
                                        {opt.icon}
                                        {opt.label}
                                    </button>
                                ))}
                            </div>

                            {/* Address fields */}
                            <div className="mt-4 space-y-3">
                                <div>
                                    <label className={labelFloatCls}>País / Región</label>
                                    <div className="relative">
                                        <select className={inputCls + " pr-10 appearance-none"} defaultValue="Colombia">
                                            <option>Colombia</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <input required value={form.name} onChange={set("name")} placeholder="Nombre" className={inputCls} />
                                    <input required value={form.lastName} onChange={set("lastName")} placeholder="Apellidos" className={inputCls} />
                                </div>
                                <input required value={form.docNumber} onChange={set("docNumber")} placeholder="Cédula – NIT sin dígito de verificación" className={inputCls} />
                                <input required value={form.address} onChange={set("address")} placeholder="Dirección" className={inputCls} />
                                <input value={form.apt} onChange={set("apt")} placeholder="Casa, apartamento, etc. (opcional)" className={inputCls} />
                                <div className="grid grid-cols-[1fr_auto_auto] gap-3">
                                    <input required value={form.city} onChange={set("city")} placeholder="Ciudad o Municipio" className={inputCls} />
                                    <div className="relative">
                                        <select value={form.department} onChange={set("department")} className={inputCls + " pr-8 appearance-none min-w-[150px]"}>
                                            {COL_DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                    </div>
                                    <input value={form.postal} onChange={set("postal")} placeholder="C.P. (opc.)" className={inputCls + " w-28"} />
                                </div>
                                <input required value={form.phone} onChange={set("phone")} placeholder="Celular" type="tel" className={inputCls} />
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer mt-2">
                                <input type="checkbox" checked={form.saveInfo} onChange={set("saveInfo")} className="mt-0.5 w-4 h-4 accent-brand-red rounded flex-shrink-0" />
                                <span className="text-sm text-neutral-500">Guardar mi información y consultar más rápidamente la próxima vez</span>
                            </label>

                            {/* Birthday optional */}
                            <div className="mt-3">
                                <label className={labelFloatCls}>Fecha de Cumpleaños (opcional)</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {(["year", "month", "day"] as const).map((k, i) => (
                                        <div key={k} className="relative">
                                            <select
                                                value={form.birthday[k]}
                                                onChange={e => setForm(f => ({ ...f, birthday: { ...f.birthday, [k]: e.target.value } }))}
                                                className={inputCls + " pr-8 appearance-none"}
                                            >
                                                <option value="">{["Año", "Mes", "Día"][i]}</option>
                                                {k === "year" && Array.from({ length: 80 }, (_, i) => 2010 - i).map(y => <option key={y}>{y}</option>)}
                                                {k === "month" && ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"].map((m, mi) => <option key={mi} value={mi + 1}>{m}</option>)}
                                                {k === "day" && Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d}>{d}</option>)}
                                            </select>
                                            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Note */}
                            <div className="mt-4 flex gap-3 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                                <Info size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-700">
                                    <strong>Nota:</strong> Verifica que la dirección de entrega, productos y tallas seleccionados estén correctos y completos.
                                </p>
                            </div>
                        </Section>

                        {/* ── MÉTODOS DE ENVÍO ──────────────────────────── */}
                        <Section title="Métodos de envío">
                            <div className="border border-neutral-200 rounded-xl overflow-hidden">
                                <div className="flex items-center justify-between px-5 py-4 bg-white">
                                    <div className="flex items-center gap-3">
                                        <Truck size={18} className="text-neutral-400" />
                                        <span className="text-sm font-medium">Costo de Envío</span>
                                    </div>
                                    <span className={`font-bold text-sm ${shippingFree ? "text-green-600" : "text-brand-black"}`}>
                                        {shippingFree ? "GRATIS" : fmt(shippingCost)}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-3 flex gap-2.5 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                                <Info size={15} className="text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-blue-700 space-y-0.5 leading-relaxed">
                                    <p>• Entrega en Medellín, Envigado, Sabaneta, Itagüí y Bello mismo día para pedidos antes de las 3pm.</p>
                                    <p>• En ciudades principales en 2–5 días hábiles.</p>
                                    <p>• Resto del país 4–7 días hábiles.</p>
                                    <p>• <strong>Envío gratis</strong> para compras superiores a $150.000 COP.</p>
                                    <p className="pt-1 text-blue-600">Derecho de retracto de 5 días hábiles · 45 días para cambios con etiquetas.</p>
                                </div>
                            </div>
                        </Section>

                        {/* ── PAGO ──────────────────────────────────────── */}
                        <Section
                            title="Pago"
                            subtitle={
                                <span className="flex items-center gap-1 text-xs text-neutral-400">
                                    <Shield size={12} /> Todas las transacciones son seguras y encriptadas.
                                </span>
                            }
                        >
                            <div className="space-y-2">
                                {PAYMENT_METHODS.map(pm => (
                                    <div
                                        key={pm.id}
                                        className={`border rounded-xl overflow-hidden transition-all ${paymentMethod === pm.id ? "border-brand-black" : "border-neutral-200"}`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod(pm.id)}
                                            className="w-full flex items-center gap-4 px-5 py-4 bg-white"
                                        >
                                            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${paymentMethod === pm.id ? "border-brand-black bg-brand-black" : "border-neutral-300"}`}>
                                                {paymentMethod === pm.id && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[1px]" />}
                                            </div>
                                            <span className="text-sm font-medium flex-1 text-left">{pm.label}</span>
                                            {pm.logos && (
                                                <div className="flex gap-1.5">
                                                    {pm.logos.map(l => (
                                                        <span key={l} className="text-[10px] font-black border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-600">{l}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </button>

                                        {/* Card form */}
                                        <AnimatePresence>
                                            {paymentMethod === "card" && pm.id === "card" && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden border-t border-neutral-100 bg-neutral-50"
                                                >
                                                    <div className="p-5 space-y-3">
                                                        <div className="relative">
                                                            <input value={form.cardNumber} onChange={set("cardNumber")} placeholder="Número de tarjeta" className={inputCls} maxLength={19} />
                                                            <CreditCard size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-300" />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input value={form.cardExpiry} onChange={set("cardExpiry")} placeholder="Fecha de vencimiento (MM / AA)" className={inputCls} />
                                                            <input value={form.cardCvv} onChange={set("cardCvv")} placeholder="Código de seguridad" className={inputCls} maxLength={4} />
                                                        </div>
                                                        <input value={form.cardHolder} onChange={set("cardHolder")} placeholder="Nombre del titular" className={inputCls} />
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="relative">
                                                                <label className={labelFloatCls}>Documento</label>
                                                                <select value={form.cardDocType} onChange={set("cardDocType")} className={inputCls + " pr-8 appearance-none"}>
                                                                    <option value="cc">C.C.</option>
                                                                    <option value="ce">C.E.</option>
                                                                    <option value="nit">NIT</option>
                                                                    <option value="pasaporte">Pasaporte</option>
                                                                </select>
                                                                <ChevronDown size={14} className="absolute right-2 bottom-3.5 text-neutral-400 pointer-events-none" />
                                                            </div>
                                                            <input value={form.cardDocNumber} onChange={set("cardDocNumber")} placeholder="Número de documento" className={inputCls} />
                                                        </div>
                                                        <div className="relative">
                                                            <label className={labelFloatCls}>Cuotas</label>
                                                            <select value={form.installments} onChange={set("installments")} className={inputCls + " pr-8 appearance-none"}>
                                                                <option value="1">1 cuota sin intereses</option>
                                                                <option value="3">3 cuotas</option>
                                                                <option value="6">6 cuotas</option>
                                                                <option value="12">12 cuotas</option>
                                                                <option value="24">24 cuotas</option>
                                                                <option value="36">36 cuotas</option>
                                                            </select>
                                                            <ChevronDown size={14} className="absolute right-2 bottom-3.5 text-neutral-400 pointer-events-none" />
                                                        </div>
                                                        <p className="text-xs text-neutral-400">Si hay intereses, lo aplicará y cobrará tu banco.</p>
                                                        <label className="flex items-center gap-3 mt-2 cursor-pointer">
                                                            <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-red rounded" />
                                                            <span className="text-sm text-neutral-600">Usar la dirección de envío como dirección de facturación</span>
                                                        </label>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* ── CTA ───────────────────────────────────────── */}
                        <button
                            type="submit"
                            disabled={placing}
                            className="w-full py-4.5 py-[18px] bg-brand-black text-white font-heading uppercase tracking-widest text-sm rounded-xl hover:bg-brand-red transition-colors shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                            {placing ? (
                                <>
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                                    </svg>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} />
                                    Pagar ahora · {fmt(grandTotal)}
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-6 pt-2 pb-6">
                            <span className="text-xs text-neutral-400">© 2025 HIGHHOOD</span>
                            <Link href="#" className="text-xs text-neutral-400 hover:text-brand-red transition-colors">Política de privacidad</Link>
                            <Link href="#" className="text-xs text-neutral-400 hover:text-brand-red transition-colors">Términos</Link>
                        </div>
                    </form>

                    {/* ════════════════════════════════════════════════════════
                        RIGHT — ORDER SUMMARY (Desktop sticky)
                    ════════════════════════════════════════════════════════ */}
                    <div className="hidden lg:block order-1 lg:order-2 lg:sticky lg:top-24">
                        <div className="bg-[#f0f0f0] rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
                            <OrderSummary items={items} totalPrice={totalPrice} shippingCost={shippingCost} discount={discount} grandTotal={grandTotal} taxIncluded={taxIncluded} discountCode={discountCode} setDiscountCode={setDiscountCode} discountApplied={discountApplied} setDiscountApplied={setDiscountApplied} />
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({ title, subtitle, action, children }: {
    title: string;
    subtitle?: React.ReactNode;
    action?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-neutral-50 flex items-center justify-between">
                <div>
                    <h2 className="font-heading text-lg uppercase tracking-widest text-brand-black">{title}</h2>
                    {subtitle && <div className="mt-0.5">{subtitle}</div>}
                </div>
                {action}
            </div>
            <div className="px-6 py-5 space-y-4">
                {children}
            </div>
        </div>
    );
}

// ─── Order Summary (shared between mobile + desktop) ─────────────────────────
function OrderSummary({
    items, totalPrice, shippingCost, discount, grandTotal, taxIncluded,
    discountCode, setDiscountCode, discountApplied, setDiscountApplied,
}: {
    items: import("@/context/CartContext").CartItem[];
    totalPrice: number; shippingCost: number; discount: number;
    grandTotal: number; taxIncluded: number;
    discountCode: string; setDiscountCode: (v: string) => void;
    discountApplied: boolean; setDiscountApplied: (v: boolean) => void;
}) {
    return (
        <div className="p-5 space-y-5">
            {/* Items */}
            <div className="space-y-4">
                {items.map(item => {
                    const price = item.onSale && item.salePrice ? item.salePrice : item.price;
                    return (
                        <div key={item.id} className="flex items-center gap-4">
                            {/* Image with badge */}
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border border-white shadow-sm bg-neutral-100">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-neutral-500 text-white text-[10px] font-bold flex items-center justify-center">
                                    {item.quantity}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-brand-black leading-tight truncate">{item.name}</p>
                                <p className="text-xs text-neutral-400 mt-0.5">{item.brand}</p>
                            </div>
                            <p className="text-sm font-bold text-brand-black flex-shrink-0">{fmt(price * item.quantity)}</p>
                        </div>
                    );
                })}
            </div>

            {/* Discount code */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Tag size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                    <input
                        value={discountCode}
                        onChange={e => setDiscountCode(e.target.value)}
                        placeholder="Código de descuento o tarjeta de regalo"
                        className="w-full border border-neutral-200 rounded-xl pl-9 pr-4 py-3 text-sm bg-white focus:outline-none focus:border-brand-red transition-all"
                    />
                </div>
                <button
                    type="button"
                    onClick={() => { if (discountCode.trim()) setDiscountApplied(true); }}
                    className="px-4 py-3 bg-neutral-800 text-white text-sm font-semibold rounded-xl hover:bg-brand-red transition-colors whitespace-nowrap"
                >
                    Aplicar
                </button>
            </div>
            {discountApplied && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                    ✓ Descuento del 10% aplicado
                </motion.p>
            )}

            {/* Totals */}
            <div className="space-y-2.5 pt-3 border-t border-neutral-200">
                <div className="flex justify-between text-sm text-neutral-600">
                    <span>Subtotal · {items.reduce((s, i) => s + i.quantity, 0)} artículos</span>
                    <span>{fmt(totalPrice)}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600 font-medium">
                        <span>Descuento ({discountCode})</span>
                        <span>– {fmt(discount)}</span>
                    </div>
                )}
                <div className="flex justify-between text-sm text-neutral-600">
                    <span className="flex items-center gap-1">
                        Envío
                        <Info size={13} className="text-neutral-300" />
                    </span>
                    <span className={shippingCost === 0 ? "text-green-600 font-semibold" : ""}>
                        {shippingCost === 0 ? "GRATIS" : fmt(shippingCost)}
                    </span>
                </div>
                <div className="flex justify-between items-baseline pt-2 border-t border-neutral-200">
                    <span className="font-heading text-lg uppercase tracking-widest text-brand-black">Total</span>
                    <div className="text-right">
                        <span className="text-xs text-neutral-400 mr-1">COP</span>
                        <span className="font-heading text-xl text-brand-black">{fmt(grandTotal)}</span>
                    </div>
                </div>
                <p className="text-xs text-neutral-400">Incluye {fmt(taxIncluded)} de impuestos</p>
            </div>
        </div>
    );
}
