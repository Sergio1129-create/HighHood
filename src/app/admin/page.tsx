"use client";

import { useState, useEffect, useTransition } from "react";
import {
    Plus, Trash2, Edit, Image as ImageIcon, Box, BarChart3,
    TrendingUp, TrendingDown, ShoppingCart, Users, Package,
    DollarSign, Clock, CheckCircle, XCircle, Truck, AlertTriangle,
    Layers, RefreshCw, Search, ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Server Actions
import { getAdminProducts, createProduct, updateProduct, deleteProduct, ProductInput } from "@/actions/admin-products";
import { getBrands, createBrand, deleteBrand, getCategories, createCategory } from "@/actions/admin-catalogs";
import { getAdminMetrics } from "@/actions/admin-metrics";
import { getAdminCustomers, updateOrderStatus } from "@/actions/admin-customers";

type Tab = "products" | "metrics" | "customers" | "images";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    pending: { label: "Pendiente", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", icon: <Clock size={12} /> },
    confirmed: { label: "Confirmado", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: <CheckCircle size={12} /> },
    processing: { label: "Preparando", color: "text-purple-400 bg-purple-500/10 border-purple-500/20", icon: <Package size={12} /> },
    shipped: { label: "Enviado", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20", icon: <Truck size={12} /> },
    delivered: { label: "Entregado", color: "text-green-400 bg-green-500/10 border-green-500/20", icon: <CheckCircle size={12} /> },
    cancelled: { label: "Cancelado", color: "text-red-400 bg-red-500/10 border-red-500/20", icon: <XCircle size={12} /> },
    refunded: { label: "Reembolso", color: "text-orange-400 bg-orange-500/10 border-orange-500/20", icon: <AlertTriangle size={12} /> },
};

const DEFAULT_BGS = {
    hero: "/images/fondo-hero.png",
    shop: "/images/fondo-shop-section.png",
    reels: "/images/fondo-reels.png",
    admin: "/images/fondo-admin.png",
};

const inputCls = "w-full bg-[#1a1a1a] border border-white/10 p-3 rounded-xl text-sm text-white placeholder-white/20 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all";
const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("products");
    const [isMounted, setIsMounted] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isOperatingBrand, setIsOperatingBrand] = useState(false);

    // ── Server Data ─────────────────────────────────────────────────────────────
    const [products, setProducts] = useState<any[]>([]);
    const [brands, setBrands] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [customerSearch, setCustomerSearch] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
    const [metrics, setMetrics] = useState<any>({ totalSales: 0, itemsSold: 0, totalOrders: 0, totalCustomers: 0, avgOrderValue: 0, conversionRate: 0 });

    // ── Forms ─────────────────────────────────────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<ProductInput & { id?: string }>>({});

    // ── Form Arrays ─────────────────────────────────────────────────────────────
    const [formVariants, setFormVariants] = useState<ProductInput['variants']>([]);
    const [formImages, setFormImages] = useState<ProductInput['images']>([]);

    // ── New Brand Creation ─────────────────────────────────────────────────────
    const [isCreatingBrand, setIsCreatingBrand] = useState(false);
    const [newBrandName, setNewBrandName] = useState("");

    // ── Gallery images & Backgrounds ───────────────────────────────────────────
    const [images, setImages] = useState<{ id: string; url: string; role: string }[]>([]);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [newImageRole, setNewImageRole] = useState("general");
    const [heroBg, setHeroBg] = useState(DEFAULT_BGS.hero);
    const [shopBg, setShopBg] = useState(DEFAULT_BGS.shop);
    const [reelsBg, setReelsBg] = useState(DEFAULT_BGS.reels);
    const [adminBg, setAdminBg] = useState(DEFAULT_BGS.admin);
    const [editBg, setEditBg] = useState<{ key: "hero" | "shop" | "reels" | "admin"; val: string } | null>(null);



    // ── Init Data ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        setIsMounted(true);
        loadData();

        // Local UI states initialization
        const savedImages = localStorage.getItem("highhood_admin_images");
        const defaultImages = [{ id: "img1", url: "/images/brands-bg.png", role: "general" }];
        setImages(savedImages ? JSON.parse(savedImages) : defaultImages);
        if (!savedImages) localStorage.setItem("highhood_admin_images", JSON.stringify(defaultImages));

        setHeroBg(localStorage.getItem("hh_bg_hero") || DEFAULT_BGS.hero);
        setShopBg(localStorage.getItem("hh_bg_shop") || DEFAULT_BGS.shop);
        setReelsBg(localStorage.getItem("hh_bg_reels") || DEFAULT_BGS.reels);
        setAdminBg(localStorage.getItem("hh_bg_admin") || DEFAULT_BGS.admin);
    }, []);

    const loadData = async () => {
        try {
            const [p, b, c, m, custs] = await Promise.all([
                getAdminProducts(),
                getBrands(),
                getCategories(),
                getAdminMetrics(),
                getAdminCustomers()
            ]);
            setProducts(p);
            setBrands(b);
            setCategories(c);
            setMetrics(m.metrics);
            setOrders(m.recentOrders);
            setCustomers(custs);
        } catch (error) {
            console.error("Admin Load Error:", error);
        }
    };

    useEffect(() => {
        const handleTab = (e: Event) => setActiveTab((e as CustomEvent).detail as Tab);
        window.addEventListener("admin:setTab", handleTab);
        return () => window.removeEventListener("admin:setTab", handleTab);
    }, []);

    useEffect(() => { if (isMounted) localStorage.setItem("highhood_admin_images", JSON.stringify(images)); }, [images, isMounted]);

    if (!isMounted) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <p className="font-heading text-brand-red animate-pulse uppercase tracking-widest text-sm">Cargando Admin...</p>
        </div>
    );

    // ── Image Handlers (Local for now, can move to DB) ──────────────────────────────────────────────────────────────
    const handleAddImage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newImageUrl) return;
        setImages([...images, { id: `img_${Date.now()}`, url: newImageUrl, role: newImageRole }]);
        setNewImageUrl("");
    };
    const handleDeleteImage = (id: string) => {
        if (confirm("¿Seguro que deseas eliminar esta imagen?")) setImages(images.filter(i => i.id !== id));
    };
    const handleSaveBg = () => {
        if (!editBg) return;
        if (editBg.key === "hero") { setHeroBg(editBg.val); localStorage.setItem("hh_bg_hero", editBg.val); }
        if (editBg.key === "shop") { setShopBg(editBg.val); localStorage.setItem("hh_bg_shop", editBg.val); }
        if (editBg.key === "reels") { setReelsBg(editBg.val); localStorage.setItem("hh_bg_reels", editBg.val); }
        if (editBg.key === "admin") {
            setAdminBg(editBg.val);
            localStorage.setItem("hh_bg_admin", editBg.val);
            window.dispatchEvent(new CustomEvent("admin:bgChange", { detail: editBg.val }));
        }
        setEditBg(null);
    };
    const resetBg = (key: "hero" | "shop" | "reels" | "admin") => {
        if (key === "hero") { setHeroBg(DEFAULT_BGS.hero); localStorage.removeItem("hh_bg_hero"); }
        if (key === "shop") { setShopBg(DEFAULT_BGS.shop); localStorage.removeItem("hh_bg_shop"); }
        if (key === "reels") { setReelsBg(DEFAULT_BGS.reels); localStorage.removeItem("hh_bg_reels"); }
        if (key === "admin") {
            setAdminBg(DEFAULT_BGS.admin);
            localStorage.removeItem("hh_bg_admin");
            window.dispatchEvent(new CustomEvent("admin:bgChange", { detail: DEFAULT_BGS.admin }));
        }
    };


    // ── Product Handlers ──────────────────────────────────────────────────────────────

    const handleAddVariant = () => { setFormVariants([...formVariants, { size: "M", stock_quantity: 0 }]); };
    const handleUpdateVariant = (index: number, field: string, value: any) => { const newV = [...formVariants]; newV[index] = { ...newV[index], [field]: value }; setFormVariants(newV); };
    const handleRemoveVariant = (index: number) => { setFormVariants(formVariants.filter((_, i) => i !== index)); };

    const handleAddProductImage = () => { setFormImages([...formImages, { url: "", is_primary: formImages.length === 0 }]); };
    const handleUpdateProductImage = (index: number, url: string) => { const newI = [...formImages]; newI[index].url = url; setFormImages(newI); };
    const handleRemoveProductImage = (index: number) => { setFormImages(formImages.filter((_, i) => i !== index)); };

    const handleCreateBrandInline = async () => {
        if (!newBrandName.trim()) return;
        setIsOperatingBrand(true);
        try {
            const b = await createBrand(newBrandName.trim());
            setBrands([...brands, b]);
            setCurrentProduct(prev => ({ ...prev, brand_id: b.id }));
            setIsCreatingBrand(false);
            setNewBrandName("");
        } finally {
            setIsOperatingBrand(false);
        }
    };

    const handleDeleteBrand = async () => {
        if (!currentProduct.brand_id) return;
        const brandToDelete = brands.find(b => b.id === currentProduct.brand_id);
        if (!brandToDelete) return;

        if (!confirm(`¿Estás seguro de eliminar la marca "${brandToDelete.name}"? Esto la quitará de todos los productos y menús.`)) return;

        setIsOperatingBrand(true);
        try {
            await deleteBrand(brandToDelete.id);
            setBrands(brands.filter(b => b.id !== brandToDelete.id));
            setCurrentProduct(prev => ({ ...prev, brand_id: "" }));
        } catch (error) {
            console.error("Error deleting brand:", error);
            alert("No se pudo eliminar la marca. Es posible que tenga productos asociados.");
        } finally {
            setIsOperatingBrand(false);
        }
    };

    const openCreateForm = () => {
        setIsEditing(false);
        setCurrentProduct({ base_price: 0, is_active: true, is_trending: false });
        setFormVariants([{ size: "M", stock_quantity: 1 }]);
        setFormImages([{ url: "", is_primary: true }]);
        setShowForm(true);
    };

    const openEditForm = (p: any) => {
        setIsEditing(true);
        setCurrentProduct({
            id: p.id,
            name: p.name,
            brand_id: p.brand_id,
            description: p.description,
            base_price: Number(p.base_price),
            sale_price: p.sale_price ? Number(p.sale_price) : null,
            is_active: p.is_active,
            is_trending: p.is_trending || false,
        });
        setFormVariants(p.variants.map((v: any) => ({ id: v.id, size: v.size, color: v.color, stock_quantity: v.stock_quantity, sku: v.sku })));
        setFormImages(p.images.map((img: any) => ({ id: img.id, url: img.url, is_primary: img.is_primary })));
        setShowForm(true);
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProduct.name || currentProduct.base_price === undefined) return alert("Nombre y precio base requeridos");

        const payload: ProductInput = {
            name: currentProduct.name,
            brand_id: currentProduct.brand_id,
            description: currentProduct.description,
            base_price: currentProduct.base_price,
            sale_price: currentProduct.sale_price,
            is_active: currentProduct.is_active,
            is_trending: currentProduct.is_trending,
            variants: formVariants,
            images: formImages
        };

        startTransition(async () => {
            if (isEditing && currentProduct.id) {
                await updateProduct(currentProduct.id, payload);
            } else {
                await createProduct(payload);
            }
            await loadData();
            setShowForm(false);
        });
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm("¿Seguro que deseas eliminar este producto (y todas sus variantes e imágenes)?")) {
            startTransition(async () => {
                await deleteProduct(id);
                await loadData();
            });
        }
    };
    const handleStatusChange = (orderId: string, newStatus: string) => {
        // 1. Optimistic Update (Immediate Feedback to the USER)
        setCustomers(prev => prev.map(c => ({
            ...c,
            orders: c.orders.map((o: any) => o.id === orderId ? { ...o, status: newStatus } : o)
        })));
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus.toLowerCase() } : o));

        // 2. Background Sync (No loading spinners)
        updateOrderStatus(orderId, newStatus).catch(error => {
            console.error("Error optimista:", error);
            alert("No se pudo sincronizar el estado. Recargando...");
            loadData(); // Revert back to truth if network fails
        });
    };
    const totalStockSummary = (variants: any[]) => variants.reduce((acc, v) => acc + v.stock_quantity, 0);

    const filteredCustomers = customers.filter(c => {
        if (!customerSearch) return true;
        const query = customerSearch.toLowerCase();
        return c.name.toLowerCase().includes(query) || c.email.toLowerCase().includes(query);
    });
    const selectedCustomerData = customers.find(c => c.id === selectedCustomerId);

    return (
        <div className="space-y-6 text-white/80">

            <AnimatePresence mode="wait">

                {/* ════════════════════════════════════════════════════════════
                    PRODUCTS TAB
                ════════════════════════════════════════════════════════════ */}
                {activeTab === "products" && (
                    <motion.div key="products" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-6">

                        <div className="flex flex-wrap gap-3 items-center justify-between bg-black/40 border border-white/5 p-4 sm:p-5 rounded-2xl">
                            <div>
                                <h2 className="font-heading text-lg sm:text-xl uppercase tracking-widest text-white">Catálogo de Productos Prisma</h2>
                                <p className="text-xs text-neutral-500 mt-0.5">{products.length} productos registrados</p>
                            </div>
                            <button onClick={openCreateForm} className="bg-brand-red text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-brand-red/80 transition-colors flex items-center gap-2 rounded-xl shadow-lg shadow-brand-red/20">
                                <Plus size={15} /> Nuevo Producto
                            </button>
                        </div>

                        <AnimatePresence>
                            {showForm && (
                                <motion.form onSubmit={handleSaveProduct}
                                    initial={{ opacity: 0, height: 0, overflow: "hidden" }}
                                    animate={{ opacity: 1, height: "auto", overflow: "visible" }}
                                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                                    transition={{ duration: 0.25 }}
                                    className="bg-black/50 border border-brand-red/20 p-5 sm:p-7 rounded-2xl shadow-2xl space-y-6">
                                    <h3 className="font-heading text-base sm:text-lg text-white uppercase tracking-widest border-b border-white/10 pb-4">
                                        {isEditing ? "✏️ Editar Producto" : "🆕 Crear Producto"}
                                    </h3>

                                    {/* INFO BASE */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div><label className={labelCls}>Nombre *</label><input type="text" required value={currentProduct.name || ""} onChange={e => setCurrentProduct({ ...currentProduct, name: e.target.value })} className={inputCls} placeholder="Ej. Supreme Box Logo Hoodie" disabled={isPending} /></div>

                                        <div>
                                            <label className={labelCls}>Marca</label>
                                            {!isCreatingBrand ? (
                                                <div className="flex gap-2">
                                                    <select value={currentProduct.brand_id || ""} onChange={e => setCurrentProduct({ ...currentProduct, brand_id: e.target.value })} className={inputCls} disabled={isPending || isOperatingBrand}>
                                                        <option value="">(Sin Marca)</option>
                                                        {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                                    </select>
                                                    {currentProduct.brand_id && (
                                                        <button type="button" onClick={handleDeleteBrand} className="px-3 text-red-500 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 rounded-xl transition-all" disabled={isPending || isOperatingBrand}>
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                    <button type="button" onClick={() => setIsCreatingBrand(true)} className="px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all" disabled={isPending || isOperatingBrand}>+</button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <input type="text" value={newBrandName} onChange={e => setNewBrandName(e.target.value)} placeholder="Nueva marca..." className={inputCls} disabled={isOperatingBrand} />
                                                    <button type="button" onClick={handleCreateBrandInline} className="px-4 text-[10px] font-bold bg-white/10 hover:bg-white/20 rounded-xl transition-all" disabled={isOperatingBrand}>OK</button>
                                                    <button type="button" onClick={() => setIsCreatingBrand(false)} className="px-3 text-white/50 hover:text-white border border-transparent hover:border-white/10 rounded-xl transition-all" disabled={isOperatingBrand}>X</button>
                                                </div>
                                            )}
                                        </div>

                                        <div><label className={labelCls}>Precio Base (COP) *</label><input type="number" required min="0" value={currentProduct.base_price || ""} onChange={e => setCurrentProduct({ ...currentProduct, base_price: Number(e.target.value) })} className={inputCls} disabled={isPending} /></div>
                                        <div><label className={labelCls}>Precio Oferta (Opcional)</label><input type="number" min="0" value={currentProduct.sale_price || ""} onChange={e => setCurrentProduct({ ...currentProduct, sale_price: Number(e.target.value) })} className={inputCls} disabled={isPending} /></div>

                                        <div className="md:col-span-2"><label className={labelCls}>Descripción</label><textarea value={currentProduct.description || ""} onChange={e => setCurrentProduct({ ...currentProduct, description: e.target.value })} rows={2} className={inputCls} placeholder="Detalles de la prenda..." disabled={isPending} /></div>

                                        <div className="md:col-span-2 flex gap-6 mt-2">
                                            <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80 font-bold uppercase tracking-widest hover:text-white transition-colors">
                                                <input type="checkbox" checked={currentProduct.is_active ?? true} onChange={e => setCurrentProduct({ ...currentProduct, is_active: e.target.checked })} className="w-4 h-4 accent-green-500 rounded bg-white/5 border-white/10" disabled={isPending} />
                                                🟢 Producto Activo
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer text-sm text-white/80 font-bold uppercase tracking-widest hover:text-white transition-colors">
                                                <input type="checkbox" checked={currentProduct.is_trending ?? false} onChange={e => setCurrentProduct({ ...currentProduct, is_trending: e.target.checked })} className="w-4 h-4 accent-brand-red rounded bg-white/5 border-white/10" disabled={isPending} />
                                                🔥 Trending Now
                                            </label>
                                        </div>
                                    </div>

                                    <div className="border border-white/5 rounded-2xl p-4 sm:p-5 bg-black/20">
                                        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                                            <label className={labelCls + " !mb-0"}>Tallas, Variantes Y Stock</label>
                                            <button type="button" onClick={handleAddVariant} className="text-[10px] font-bold uppercase tracking-widest text-brand-red bg-brand-red/10 px-3 py-1.5 rounded-lg hover:bg-brand-red/20 transition-colors">+ Añadir Talla</button>
                                        </div>
                                        <div className="space-y-3">
                                            {formVariants.map((variant, idx) => (
                                                <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <div className="flex-1 min-w-[100px]"><input type="text" value={variant.size} onChange={e => handleUpdateVariant(idx, "size", e.target.value)} placeholder="Talla (S, M, Única)" className={inputCls + " !py-2 !text-xs"} required /></div>
                                                    <div className="flex-1 min-w-[100px]"><input type="number" value={variant.stock_quantity === 0 ? "" : variant.stock_quantity} onChange={e => handleUpdateVariant(idx, "stock_quantity", Number(e.target.value))} placeholder="Stock Qty" className={inputCls + " !py-2 !text-xs"} required min="0" /></div>
                                                    <div className="flex-1 min-w-[100px]"><input type="text" value={variant.color || ""} onChange={e => handleUpdateVariant(idx, "color", e.target.value)} placeholder="Color (Opcional)" className={inputCls + " !py-2 !text-xs"} /></div>
                                                    <button type="button" onClick={() => handleRemoveVariant(idx)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                            {formVariants.length === 0 && <p className="text-xs text-red-400">Debes añadir al menos una talla.</p>}
                                        </div>
                                    </div>

                                    <div className="border border-white/5 rounded-2xl p-4 sm:p-5 bg-black/20">
                                        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                                            <label className={labelCls + " !mb-0"}>Imágenes del Producto</label>
                                            <button type="button" onClick={handleAddProductImage} className="text-[10px] font-bold uppercase tracking-widest text-brand-red bg-brand-red/10 px-3 py-1.5 rounded-lg hover:bg-brand-red/20 transition-colors">+ Añadir Img</button>
                                        </div>
                                        <div className="space-y-3">
                                            {formImages.map((img, idx) => (
                                                <div key={idx} className="flex flex-wrap sm:flex-nowrap gap-3 items-center bg-white/5 p-3 rounded-xl border border-white/5">
                                                    <ImageIcon size={16} className="text-neutral-500 hidden sm:block" />
                                                    <div className="flex-1 w-full"><input type="text" value={img.url} onChange={e => handleUpdateProductImage(idx, e.target.value)} placeholder="URL https://... o local (/images/...)" className={inputCls + " !py-2 !text-xs"} required /></div>
                                                    {img.is_primary && <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded">PRIMARIA</span>}
                                                    <button type="button" onClick={() => handleRemoveProductImage(idx)} className="p-2 text-red-400 hover:bg-red-400/20 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            ))}
                                            {formImages.length === 0 && <p className="text-xs text-red-400">Debes asignar al menos 1 imagen principal.</p>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                                        <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-white/10 text-sm uppercase tracking-widest hover:bg-white/5 transition-colors" disabled={isPending}>Cancelar</button>
                                        <button type="submit" disabled={isPending || formVariants.length === 0 || formImages.length === 0} className="px-7 py-2.5 rounded-xl bg-brand-red text-white text-sm font-bold uppercase tracking-widest hover:bg-brand-red/90 transition-colors shadow-lg shadow-brand-red/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                            {isPending ? "Guardando DB..." : "Guardar Producto Db"}
                                        </button>
                                    </div>
                                </motion.form>
                            )}
                        </AnimatePresence>

                        <div className="overflow-x-auto bg-black/30 rounded-2xl border border-white/5 relative min-h-[200px]">
                            {isPending && <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex items-center justify-center"><p className="animate-pulse font-heading text-brand-red tracking-widest">Sincronizando DB...</p></div>}
                            <table className="w-full text-left text-sm min-w-[700px]">
                                <thead className="bg-black/50 uppercase text-[11px] tracking-widest text-neutral-400 border-b border-white/5">
                                    <tr>
                                        <th className="px-3 sm:px-5 py-4 w-12 sm:w-16">Img</th>
                                        <th className="px-3 sm:px-5 py-4">Producto</th>
                                        <th className="px-3 sm:px-5 py-4 hidden sm:table-cell">Marca</th>
                                        <th className="px-3 sm:px-5 py-4">Precio</th>
                                        <th className="px-3 sm:px-5 py-4 hidden md:table-cell text-center">Stock</th>
                                        <th className="px-3 sm:px-5 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {products.map(p => {
                                        const primaryImage = p.images?.find((img: any) => img.is_primary)?.url || p.images?.[0]?.url || "/images/brands-bg.png";
                                        const totalStock = totalStockSummary(p.variants || []);
                                        return (
                                            <tr key={p.id} className={`hover:bg-white/[0.025] transition-colors ${!p.is_active ? 'opacity-50' : ''}`}>
                                                <td className="px-3 sm:px-5 py-3">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={primaryImage} alt={p.name} className="w-full h-full object-cover" />
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-5 py-3 text-white">
                                                    <span className="font-bold block truncate max-w-[120px] sm:max-w-xs">{p.name}</span>
                                                    {!p.is_active && <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded border border-red-500/20 inline-block mt-1">INACTIVO</span>}
                                                    {/* Mostrar marca en móvil debajo del nombre ya que la columna original se esconde */}
                                                    <span className="block sm:hidden text-[10px] text-neutral-500 uppercase tracking-widest mt-0.5">
                                                        {p.brand?.name || '---'} | Stock: {totalStock}
                                                    </span>
                                                </td>
                                                <td className="px-3 sm:px-5 py-3 text-neutral-400 text-xs uppercase tracking-widest font-bold hidden sm:table-cell">{p.brand?.name || '---'}</td>
                                                <td className="px-3 sm:px-5 py-3 text-white">
                                                    <div className="text-sm font-bold">${Number(p.base_price).toLocaleString('es-CO')}</div>
                                                    {p.sale_price && <div className="text-[10px] text-brand-red uppercase tracking-widest mt-0.5">Sale: ${Number(p.sale_price).toLocaleString('es-CO')}</div>}
                                                </td>
                                                <td className="px-3 sm:px-5 py-3 text-center hidden md:table-cell">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className={`px-2 py-1 rounded text-[11px] font-bold ${totalStock <= 2 ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-green-500/10 text-green-400 border border-green-500/20"}`}>
                                                            {totalStock}
                                                        </span>
                                                        <div className="flex gap-1 flex-wrap max-w-[120px] justify-center">
                                                            {(p.variants || []).map((v: any) => (
                                                                <span key={v.id} className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded text-neutral-400" title={`Stock: ${v.stock_quantity}`}>
                                                                    {v.size}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-3 sm:px-5 py-3 text-right whitespace-nowrap">
                                                    <button onClick={() => openEditForm(p)} className="p-1.5 sm:p-2 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all" disabled={isPending}><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 sm:p-2 text-neutral-400 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-all" disabled={isPending}><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {products.length === 0 && !isPending && (
                                        <tr><td colSpan={6} className="text-center py-20 text-neutral-500 uppercase tracking-widest text-xs border border-white/5 border-dashed rounded-2xl">Aún no hay productos en tu base de datos.<br /><br />Toca "NUEVO PRODUCTO" arriba.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    METRICS TAB
                ════════════════════════════════════════════════════════════ */}
                {activeTab === "metrics" && (
                    <motion.div key="metrics"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }} className="space-y-6">

                        <div className="bg-black/40 border border-white/5 p-4 sm:p-5 rounded-2xl">
                            <h2 className="font-heading text-lg sm:text-xl uppercase tracking-widest text-white">Métricas y Analítica</h2>
                            <p className="text-xs text-neutral-500 mt-0.5">Visión preeliminar simulada por ahora.</p>
                        </div>

                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
                            {[
                                { label: "Ventas Totales", value: `$${metrics.totalSales.toLocaleString('es-CO')}`, icon: <DollarSign size={22} />, color: "from-green-500/15", border: "border-green-500/20", text: "text-green-400", trend: "+12.5%", up: true },
                                { label: "Total Órdenes", value: metrics.totalOrders, icon: <ShoppingCart size={22} />, color: "from-blue-500/15", border: "border-blue-500/20", text: "text-blue-400", trend: "+8.2%", up: true },
                                { label: "Artículos Vendidos", value: metrics.itemsSold, icon: <Package size={22} />, color: "from-purple-500/15", border: "border-purple-500/20", text: "text-purple-400", trend: "+5.0%", up: true },
                                { label: "Clientes", value: metrics.totalCustomers, icon: <Users size={22} />, color: "from-cyan-500/15", border: "border-cyan-500/20", text: "text-cyan-400", trend: "+15.3%", up: true },
                                { label: "Ticket Promedio", value: `$${metrics.avgOrderValue.toLocaleString('es-CO')}`, icon: <BarChart3 size={22} />, color: "from-yellow-500/15", border: "border-yellow-500/20", text: "text-yellow-400", trend: "-2.1%", up: false },
                                { label: "Conversión", value: `${metrics.conversionRate}%`, icon: <TrendingUp size={22} />, color: "from-pink-500/15", border: "border-pink-500/20", text: "text-pink-400", trend: "+0.4%", up: true },
                            ].map(kpi => (
                                <div key={kpi.label} className={`bg-black/40 border ${kpi.border} rounded-2xl p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden group hover:shadow-lg transition-shadow`}>
                                    <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.text} bg-white/5 border border-white/5 relative z-10`}>{kpi.icon}</div>
                                    <div className="relative z-10">
                                        <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{kpi.label}</p>
                                        <p className="font-heading text-white text-xl sm:text-2xl mt-0.5 leading-tight">{kpi.value}</p>
                                        <p className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${kpi.up ? "text-green-400" : "text-red-400"}`}>
                                            {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}{kpi.trend}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
                            {/* Recent Orders */}
                            <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                                <div className="bg-black/30 px-5 py-4 border-b border-white/5 flex items-center justify-between">
                                    <h3 className="font-heading text-sm text-white uppercase tracking-widest">Órdenes Recientes</h3>
                                    <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{orders.length} órdenes</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm min-w-[480px]">
                                        <thead className="bg-black/20 text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/5">
                                            <tr>
                                                <th className="px-4 py-3 text-left">Orden</th>
                                                <th className="px-4 py-3 text-left hidden sm:table-cell">Cliente</th>
                                                <th className="px-4 py-3 text-left">Total</th>
                                                <th className="px-4 py-3 text-left">Estado</th>
                                                <th className="px-4 py-3 text-left hidden md:table-cell">Fecha</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {orders.map(order => {
                                                const st = statusConfig[order.status];
                                                return (
                                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-4 py-3">
                                                            <span className="font-mono text-[11px] text-neutral-400">{order.id.split('-').slice(-1)[0]}</span>
                                                            <span className="block text-[10px] text-neutral-600 sm:hidden">{order.customer}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-white/80 hidden sm:table-cell">{order.customer}</td>
                                                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">${order.total.toLocaleString('es-CO')}</td>
                                                        <td className="px-4 py-3">
                                                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border ${st.color}`}>
                                                                {st.icon} {st.label}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 text-neutral-500 text-[11px] hidden md:table-cell whitespace-nowrap">{order.date}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    CUSTOMERS TAB
                ════════════════════════════════════════════════════════════ */}
                {activeTab === "customers" && (
                    <motion.div key="customers"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }} className="space-y-6">

                        <div className="bg-black/40 border border-white/5 rounded-2xl overflow-hidden">
                            {!selectedCustomerId ? (
                                <>
                                    <div className="bg-black/30 px-5 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <h3 className="font-heading text-sm text-white uppercase tracking-widest">Base de Clientes</h3>
                                            <p className="text-[11px] text-neutral-500 mt-0.5">Control y gestión de pedidos e históricos.</p>
                                        </div>
                                        <div className="relative w-full max-w-xs">
                                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                                            <input
                                                type="text"
                                                placeholder="Buscar por nombre o email..."
                                                value={customerSearch}
                                                onChange={(e) => setCustomerSearch(e.target.value)}
                                                className="w-full bg-[#111] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red/50 transition-all font-mono"
                                            />
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto min-h-[300px]">
                                        <table className="w-full text-left text-xs min-w-[600px]">
                                            <thead className="bg-[#151515] text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/5">
                                                <tr>
                                                    <th className="px-5 py-4">Cliente</th>
                                                    <th className="px-5 py-4">Compras</th>
                                                    <th className="px-5 py-4 text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {filteredCustomers.map(c => (
                                                    <tr key={c.id} className="hover:bg-white/[0.03] cursor-pointer transition-colors" onClick={() => setSelectedCustomerId(c.id)}>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-brand-red/10 border border-brand-red/20 text-brand-red flex justify-center items-center"><Users size={14} /></div>
                                                                <div>
                                                                    <p className="font-bold text-white text-xs uppercase tracking-wider">{c.name}</p>
                                                                    <p className="text-[10px] text-neutral-500 font-mono mt-0.5 max-w-[200px] truncate">{c.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-white/80">{c.orderCount} orden(es)</td>
                                                        <td className="px-5 py-4 text-right">
                                                            <button
                                                                className="bg-white/5 hover:bg-brand-red/20 hover:text-brand-red border border-white/10 hover:border-brand-red/30 text-white text-[10px] font-bold tracking-widest px-3 py-2 rounded-lg uppercase transition-all"
                                                                onClick={(e) => { e.stopPropagation(); setSelectedCustomerId(c.id); }}
                                                            >
                                                                Ver Detalles
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {filteredCustomers.length === 0 && <p className="text-xs text-neutral-500 text-center py-16 font-mono">No se encontraron clientes asociados.</p>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="bg-black/30 px-5 py-4 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <button onClick={() => setSelectedCustomerId(null)} className="p-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all border border-white/10">
                                                <ArrowLeft size={16} />
                                            </button>
                                            <div>
                                                <h3 className="font-heading text-sm text-white uppercase tracking-widest">{selectedCustomerData.name}</h3>
                                                <p className="text-[11px] text-neutral-500 mt-0.5 font-mono">{selectedCustomerData.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 sm:p-5 flex flex-col lg:flex-row gap-6 lg:items-start">
                                        <div className="flex-shrink-0 w-full lg:w-1/4">
                                            <div className="bg-black/40 rounded-xl p-4 border border-white/5 space-y-1">
                                                <p className="text-[10px] text-neutral-400 uppercase tracking-widest mb-2">Desempeño del Cliente</p>
                                                <p className="text-[10px] text-neutral-500">Total Invertido:</p>
                                                <p className="font-bold text-green-400 text-lg mb-2">${selectedCustomerData.totalSpent.toLocaleString('es-CO')}</p>
                                                <p className="text-[10px] text-neutral-500">Volumen:</p>
                                                <p className="text-sm font-bold text-white">{selectedCustomerData.orderCount} compras</p>
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full bg-[#111] rounded-xl border border-white/5 overflow-hidden">
                                            {selectedCustomerData.orders.length > 0 ? (
                                                <table className="w-full text-left text-xs min-w-[500px]">
                                                    <thead className="bg-[#151515] text-[10px] uppercase tracking-widest text-neutral-500 border-b border-white/5">
                                                        <tr>
                                                            <th className="px-4 py-3 min-w-[100px]">Orden</th>
                                                            <th className="px-4 py-3 min-w-[150px]">Resumen</th>
                                                            <th className="px-4 py-3 min-w-[100px]">Total</th>
                                                            <th className="px-4 py-3 min-w-[140px]">Estado</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {selectedCustomerData.orders.map((o: any) => {
                                                            const st = statusConfig[o.status.toLowerCase()] || statusConfig['pending'];
                                                            return (
                                                                <tr key={o.id} className="hover:bg-white/[0.02]">
                                                                    <td className="px-4 py-3">
                                                                        <span className="block font-mono text-[11px] text-brand-red">#{o.short_id}</span>
                                                                        <span className="block text-[10px] text-neutral-500 mt-0.5">{o.date}</span>
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <div className="space-y-1">
                                                                            {o.items.map((item: any, idx: number) => (
                                                                                <div key={idx} className="flex justify-between text-[11px]">
                                                                                    <span className="text-white/80 max-w-[100px] truncate" title={item.product}>{item.qty}x {item.product}</span>
                                                                                    <span className="text-neutral-500 font-mono">Talla: {item.size}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-4 py-3 font-bold text-white">
                                                                        ${o.total.toLocaleString('es-CO')}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <select
                                                                            value={o.status}
                                                                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
                                                                            disabled={isPending}
                                                                            className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 rounded outline-none border transition-colors cursor-pointer w-full max-w-[130px] appearance-none ${st.color}`}
                                                                        >
                                                                            <option value="PENDING" className="bg-[#111] text-yellow-400">PENDIENTE</option>
                                                                            <option value="PROCESSING" className="bg-[#111] text-purple-400">PREPARANDO</option>
                                                                            <option value="SHIPPED" className="bg-[#111] text-cyan-400">ENVIADO</option>
                                                                            <option value="DELIVERED" className="bg-[#111] text-green-400">ENTREGADO</option>
                                                                            <option value="CANCELLED" className="bg-[#111] text-red-500">CANCELADO</option>
                                                                        </select>
                                                                        <div className="text-[9px] text-neutral-600 uppercase tracking-widest mt-1.5 flex items-center justify-between">
                                                                            {o.paymentStatus === 'COMPLETED' ? <span className="text-green-500 flex items-center gap-1"><CheckCircle size={9} /> PAGADO</span> : 'SIN PAGO'}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )
                                                        })}
                                                    </tbody>
                                                </table>
                                            ) : (
                                                <p className="text-xs text-neutral-500 p-4 font-mono">Sin compras activas registradas.</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                    </motion.div>
                )}

                {/* ════════════════════════════════════════════════════════════
                    IMAGES TAB
                ════════════════════════════════════════════════════════════ */}
                {activeTab === "images" && (
                    <motion.div key="images"
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }} className="space-y-6">

                        {/* Section BG header */}
                        <div className="bg-black/40 border border-white/5 p-4 sm:p-5 rounded-2xl flex items-center gap-3">
                            <Layers size={20} className="text-brand-red flex-shrink-0" />
                            <div>
                                <h2 className="font-heading text-lg sm:text-xl uppercase tracking-widest text-white">Fondos de Secciones</h2>
                                <p className="text-xs text-neutral-500 mt-0.5">Administrado localmente por ahora. Aquí podrás gestionar los assets globales globales.</p>
                            </div>
                        </div>

                        {/* 4 BG cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {([
                                { key: "hero" as const, label: "Hero Principal", desc: "Imagen de fondo de la sección de inicio", current: heroBg, badge: "🏠" },
                                { key: "shop" as const, label: "Shop / Tienda", desc: "Fondo de la sección de prendas (shop-section)", current: shopBg, badge: "🛍️" },
                                { key: "reels" as const, label: "Reels / Instagram", desc: "Fondo de la sección de reels de Instagram", current: reelsBg, badge: "🎬" },
                                { key: "admin" as const, label: "Panel Admin", desc: "Fondo del panel de administración actual", current: adminBg, badge: "⚙️" },
                            ]).map(sec => (
                                <div key={sec.key} className="bg-black/50 border border-white/10 rounded-2xl overflow-hidden shadow-lg group">
                                    <div className="relative h-44 overflow-hidden">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={sec.current} alt={sec.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                        <span className="absolute bottom-3 left-3 text-[10px] font-bold uppercase tracking-widest text-white bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-lg">
                                            {sec.label}
                                        </span>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <p className="text-[11px] text-neutral-400 leading-relaxed">{sec.desc}</p>
                                        {editBg?.key === sec.key ? (
                                            <div className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={editBg.val}
                                                    onChange={e => setEditBg({ key: sec.key, val: e.target.value })}
                                                    placeholder="/images/mi-fondo.png o https://..."
                                                    className={inputCls + " text-xs"}
                                                    autoFocus
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={handleSaveBg} className="flex-1 py-2 bg-brand-red text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-brand-red/80 transition-colors">
                                                        Guardar
                                                    </button>
                                                    <button onClick={() => setEditBg(null)} className="px-3 py-2 border border-white/10 text-white/50 text-[11px] rounded-xl hover:bg-white/5 transition-colors">
                                                        ✕
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setEditBg({ key: sec.key, val: sec.current })}
                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[11px] font-bold uppercase tracking-widest rounded-xl transition-colors"
                                                >
                                                    <Edit size={13} /> Cambiar URL
                                                </button>
                                                <button
                                                    onClick={() => resetBg(sec.key)}
                                                    className="px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white rounded-xl transition-colors"
                                                >
                                                    <RefreshCw size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
