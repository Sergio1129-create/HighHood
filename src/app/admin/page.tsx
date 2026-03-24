"use client";

import { useState, useEffect } from "react";
import { Product } from "@/data";
import { Plus, Trash2, Edit, Image as ImageIcon, Box, BarChart3 } from "lucide-react";

type Tab = "images" | "products" | "metrics";

// Initial fallback mock data so the list isn't empty if the user hasn't added anything yet.
const initialMockProducts: Product[] = [
    {
        id: "p1",
        name: "Supreme Box Logo Hoodie",
        brand: "SUPREME",
        price: 1200000,
        image: "/images/brands-bg.png",
        trending: true,
    },
    {
        id: "p2",
        name: "Stussy 8 Ball Tee",
        brand: "STUSSY",
        price: 250000,
        image: "/images/brands-bg.png",
        onSale: true,
        salePrice: 199000,
    }
];

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<Tab>("products");
    const [isMounted, setIsMounted] = useState(false);

    // ---- STATE: Products ----
    const [products, setProducts] = useState<Product[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

    // ---- STATE: Images (Hero & General) ----
    const [images, setImages] = useState<{ id: string, url: string, role: string }[]>([]);
    const [newImageUrl, setNewImageUrl] = useState("");
    const [newImageRole, setNewImageRole] = useState("hero");

    // ---- STATE: Metrics (Mocked from cart items logically) ----
    const [metrics, setMetrics] = useState({ totalSales: 0, itemsSold: 0 });

    // ---- STATE: Global Search Context ----
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        setIsMounted(true);
        // Load Products
        const savedProducts = localStorage.getItem("highhood_admin_products");
        if (savedProducts) {
            setProducts(JSON.parse(savedProducts));
        } else {
            setProducts(initialMockProducts);
            localStorage.setItem("highhood_admin_products", JSON.stringify(initialMockProducts));
        }

        // Load Images
        const savedImages = localStorage.getItem("highhood_admin_images");
        if (savedImages) {
            setImages(JSON.parse(savedImages));
        } else {
            // Default mock images
            const defaultImages = [
                { id: "img1", url: "/images/brands-bg.png", role: "hero" },
                { id: "img2", url: "/images/brands-bg.png", role: "general" }
            ];
            setImages(defaultImages);
            localStorage.setItem("highhood_admin_images", JSON.stringify(defaultImages));
        }

        // Load mock metrics based on local storage cart
        const savedCart = localStorage.getItem("highhood_cart");
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                const itemsCount = parsedCart.reduce((acc: number, item: any) => acc + item.quantity, 0);
                const salesResult = parsedCart.reduce((acc: number, item: any) => acc + ((item.onSale && item.salePrice ? item.salePrice : item.price) * item.quantity), 0);
                // Artificially inflating numbers to make metrics look "real" for the demo
                setMetrics({
                    totalSales: salesResult * 15 + 15000000, // Make it look like a store with sales
                    itemsSold: itemsCount * 5 + 142
                });
            } catch (e) {
                setMetrics({ totalSales: 15400000, itemsSold: 142 });
            }
        } else {
            setMetrics({ totalSales: 15400000, itemsSold: 142 });
        }
    }, []);

    // Effect to listen for sidebar tab changes
    useEffect(() => {
        const handleTabChange = (e: Event) => {
            const tabId = (e as CustomEvent).detail as Tab;
            setActiveTab(tabId);
        };
        const handleSearchEvent = (e: Event) => {
            const query = (e as CustomEvent).detail;
            if (typeof query === "string") setSearchQuery(query.toLowerCase());
        };
        window.addEventListener("admin:setTab", handleTabChange);
        window.addEventListener("admin:search", handleSearchEvent);
        return () => {
            window.removeEventListener("admin:setTab", handleTabChange);
            window.removeEventListener("admin:search", handleSearchEvent);
        };
    }, []);

    // Effect to auto-save products
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("highhood_admin_products", JSON.stringify(products));
        }
    }, [products, isMounted]);

    // Effect to auto-save images
    useEffect(() => {
        if (isMounted) {
            localStorage.setItem("highhood_admin_images", JSON.stringify(images));
        }
    }, [images, isMounted]);


    if (!isMounted) return <div className="p-8 text-center uppercase tracking-widest font-heading text-brand-red animate-pulse">Cargando Admin...</div>;

    // --- Product Handlers ---
    const handleSaveProduct = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProduct.name || !currentProduct.price) return alert("Nombre y precio requeridos");

        if (isEditing && currentProduct.id) {
            setProducts(products.map(p => p.id === currentProduct.id ? currentProduct as Product : p));
        } else {
            const newProd = {
                ...currentProduct,
                id: `prod_${Date.now()}`,
                image: currentProduct.image || "/images/brands-bg.png"
            } as Product;
            setProducts([...products, newProd]);
        }
        setIsEditing(false);
        setCurrentProduct({});
    };

    const handleDeleteProduct = (id: string | number) => {
        if (confirm("¿Seguro que deseas eliminar este producto?")) {
            setProducts(products.filter(p => p.id !== id));
        }
    };

    const handleEditClick = (p: Product) => {
        setIsEditing(true);
        setCurrentProduct(p);
    };

    // --- Image Handlers ---
    const handleAddImage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newImageUrl) return;
        setImages([...images, { id: `img_${Date.now()}`, url: newImageUrl, role: newImageRole }]);
        setNewImageUrl("");
    };

    const handleDeleteImage = (id: string) => {
        if (confirm("¿Seguro que deseas eliminar esta imagen?")) {
            setImages(images.filter(i => i.id !== id));
        }
    };


    const displayedProducts = products.filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery) || p.brand.toLowerCase().includes(searchQuery));
    const displayedImages = images.filter(i => !searchQuery || i.role.toLowerCase().includes(searchQuery) || i.url.toLowerCase().includes(searchQuery));

    return (
        <div className="bg-[#111] border border-white/5 rounded-2xl shadow-2xl overflow-hidden min-h-[70vh] text-white/80">

            {/* TABS HEADER - Hidden on lg screens since sidebar manages it */}
            <div className="flex border-b border-white/5 bg-black/40 lg:hidden">
                <button
                    onClick={() => setActiveTab("products")}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 font-heading text-sm uppercase tracking-widest transition-colors ${activeTab === "products" ? "bg-brand-red text-white" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}
                >
                    <Box size={16} /> Productos
                </button>
                <button
                    onClick={() => setActiveTab("images")}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 font-heading text-sm uppercase tracking-widest transition-colors ${activeTab === "images" ? "bg-brand-red text-white" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}
                >
                    <ImageIcon size={16} /> Imágenes
                </button>
                <button
                    onClick={() => setActiveTab("metrics")}
                    className={`flex-1 flex items-center justify-center gap-2 py-4 font-heading text-sm uppercase tracking-widest transition-colors ${activeTab === "metrics" ? "bg-brand-red text-white" : "text-neutral-500 hover:text-white hover:bg-white/5"}`}
                >
                    <BarChart3 size={16} /> Métricas
                </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6 md:p-8">

                {/* --- PRODUCTS TAB --- */}
                {activeTab === "products" && (
                    <div className="space-y-8">

                        <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                            <h2 className="font-heading text-xl uppercase tracking-widest text-white">Catálogo</h2>
                            <button
                                onClick={() => { setIsEditing(false); setCurrentProduct({}); }}
                                className="bg-brand-red text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-brand-red/80 transition-colors flex items-center gap-2 rounded-lg"
                            >
                                <Plus size={14} /> Nuevo
                            </button>
                        </div>

                        {/* Product Form Modal (Inline for admin simplicity) */}
                        {Object.keys(currentProduct).length > 0 || isEditing ? (
                            <form onSubmit={handleSaveProduct} className="bg-black/40 border border-white/10 p-6 rounded-xl shadow-lg mb-8 space-y-4">
                                <h3 className="font-heading text-lg text-white uppercase tracking-widest border-b border-white/10 pb-3 mb-5">
                                    {isEditing ? "Editar Producto" : "Crear Producto"}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Nombre</label>
                                        <input type="text" required value={currentProduct.name || ""} onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 p-2.5 rounded-lg text-sm text-white focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Marca</label>
                                        <input type="text" value={currentProduct.brand || ""} onChange={(e) => setCurrentProduct({ ...currentProduct, brand: e.target.value })} className="w-full bg-[#1a1a1a] border border-white/10 p-2.5 rounded-lg text-sm text-white focus:border-brand-red outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Precio Regular (COP)</label>
                                        <input type="number" required value={currentProduct.price || ""} onChange={(e) => setCurrentProduct({ ...currentProduct, price: Number(e.target.value) })} className="w-full bg-[#1a1a1a] border border-white/10 p-2.5 rounded-lg text-sm text-white focus:border-brand-red outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Precio Oferta (Opcional)</label>
                                        <input type="number" value={currentProduct.salePrice || ""} onChange={(e) => setCurrentProduct({ ...currentProduct, salePrice: Number(e.target.value) })} className="w-full bg-[#1a1a1a] border border-white/10 p-2.5 rounded-lg text-sm text-white focus:border-brand-red outline-none transition-all" />
                                    </div>
                                    <div className="space-y-1.5 md:col-span-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">URL de Imagen</label>
                                        <input type="text" value={currentProduct.image || ""} onChange={(e) => setCurrentProduct({ ...currentProduct, image: e.target.value })} placeholder="/images/tu-imagen.jpg" className="w-full bg-[#1a1a1a] border border-white/10 p-2.5 rounded-lg text-sm text-white placeholder-white/20 focus:border-brand-red outline-none transition-all" />
                                    </div>
                                </div>

                                <div className="flex gap-6 py-4">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer text-white/80 hover:text-white transition-colors">
                                        <input type="checkbox" checked={currentProduct.trending || false} onChange={(e) => setCurrentProduct({ ...currentProduct, trending: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-[#1a1a1a] text-brand-red focus:ring-brand-red accent-brand-red" />
                                        ¿Es Trending? 🔥
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer text-white/80 hover:text-white transition-colors">
                                        <input type="checkbox" checked={currentProduct.onSale || false} onChange={(e) => setCurrentProduct({ ...currentProduct, onSale: e.target.checked })} className="w-4 h-4 rounded border-white/20 bg-[#1a1a1a] text-brand-red focus:ring-brand-red accent-brand-red" />
                                        ¿Está en Oferta? 💸
                                    </label>
                                </div>

                                <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
                                    <button type="button" onClick={() => { setIsEditing(false); setCurrentProduct({}); }} className="px-5 py-2.5 rounded-lg border border-white/10 text-sm uppercase tracking-widest hover:bg-white/5 transition-colors">Cancelar</button>
                                    <button type="submit" className="px-6 py-2.5 rounded-lg bg-brand-red text-white text-sm font-bold uppercase tracking-widest hover:bg-brand-red/90 transition-colors shadow-lg shadow-brand-red/20">Guardar</button>
                                </div>
                            </form>
                        ) : null}

                        {/* Products Table */}
                        <div className="overflow-x-auto bg-black/20 rounded-xl border border-white/5">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                                <thead className="bg-black/40 uppercase text-xs tracking-widest text-neutral-400 border-b border-white/5">
                                    <tr>
                                        <th className="px-5 py-4">Imagen</th>
                                        <th className="px-5 py-4">Nombre</th>
                                        <th className="px-5 py-4">Marca</th>
                                        <th className="px-5 py-4">Precio</th>
                                        <th className="px-5 py-4">Estado</th>
                                        <th className="px-5 py-4 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {displayedProducts.map(p => (
                                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-5 py-3">
                                                <div className="w-12 h-12 bg-[#1a1a1a] rounded-lg overflow-hidden relative border border-white/10">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                </div>
                                            </td>
                                            <td className="px-5 py-3 font-medium text-white truncate max-w-[200px]">{p.name}</td>
                                            <td className="px-5 py-3 text-neutral-400">{p.brand}</td>
                                            <td className="px-5 py-3 text-white">
                                                ${p.price.toLocaleString('es-CO')}
                                                {p.onSale && p.salePrice && <span className="block text-[10px] text-brand-red mt-0.5">Sale: ${p.salePrice.toLocaleString('es-CO')}</span>}
                                            </td>
                                            <td className="px-5 py-3 flex gap-1.5 pt-5">
                                                {p.trending && <span className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] px-2 py-1 rounded">TRENDING</span>}
                                                {p.onSale && <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2 py-1 rounded">SALE</span>}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <button onClick={() => handleEditClick(p)} className="p-2.5 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition-all"><Edit size={16} /></button>
                                                <button onClick={() => handleDeleteProduct(p.id)} className="p-2.5 text-neutral-400 hover:text-brand-red hover:bg-brand-red/10 rounded-lg transition-all"><Trash2 size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                    {displayedProducts.length === 0 && (
                                        <tr><td colSpan={6} className="text-center py-12 text-neutral-500 uppercase tracking-widest text-xs">No se encontraron productos</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}


                {/* --- IMAGES TAB --- */}
                {activeTab === "images" && (
                    <div className="space-y-8">

                        <form onSubmit={handleAddImage} className="flex flex-col md:flex-row gap-5 bg-black/40 border border-white/5 p-6 rounded-xl items-end shadow-lg">
                            <div className="flex-1 w-full space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">URL de la Imagen</label>
                                <input type="text" required value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="Ej: https://...jpg o /images/banner.jpg" className="w-full bg-[#1a1a1a] border border-white/10 p-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none focus:border-brand-red transition-all" />
                            </div>
                            <div className="w-full md:w-56 space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400">Uso</label>
                                <select value={newImageRole} onChange={e => setNewImageRole(e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 p-2.5 rounded-lg text-sm text-white outline-none focus:border-brand-red transition-all">
                                    <option value="hero">Banner Hero</option>
                                    <option value="general">Uso General</option>
                                    <option value="product">Producto</option>
                                </select>
                            </div>
                            <button type="submit" className="w-full md:w-auto px-8 py-2.5 bg-brand-red text-white text-sm font-bold uppercase tracking-widest hover:bg-brand-red/90 transition-all shadow-lg shadow-brand-red/20 rounded-lg whitespace-nowrap">
                                Agregar Foto
                            </button>
                        </form>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                            {displayedImages.map(img => (
                                <div key={img.id} className="group relative aspect-square bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 shadow-lg">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={img.url} alt="Uploaded" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute top-3 left-3 bg-black/80 text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1.5 rounded-md backdrop-blur-md border border-white/10 shadow-lg">
                                        {img.role}
                                    </div>

                                    {/* Delete Overlay */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                        <button onClick={() => handleDeleteImage(img.id)} className="bg-brand-red text-white p-3.5 rounded-full hover:scale-110 transition-transform shadow-xl shadow-brand-red/20">
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {displayedImages.length === 0 && (
                                <div className="col-span-full py-20 text-center text-neutral-500 uppercase tracking-widest text-xs border border-white/5 border-dashed rounded-xl">Ninguna imagen coincide</div>
                            )}
                        </div>

                    </div>
                )}


                {/* --- METRICS TAB --- */}
                {activeTab === "metrics" && (
                    <div className="space-y-8">
                        <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-white/5">
                            <h2 className="font-heading text-xl uppercase tracking-widest text-white">Métricas y Ventas</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="bg-black/40 border border-white/5 p-8 rounded-xl shadow-lg flex flex-col items-center justify-center py-14 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-2xl flex items-center justify-center mb-5 border border-green-500/20 shadow-lg shadow-green-500/5 group-hover:scale-110 transition-transform">
                                    <BarChart3 size={32} />
                                </div>
                                <p className="text-neutral-400 uppercase tracking-widest text-xs mb-3 font-bold">Ventas Totales</p>
                                <h3 className="font-heading text-4xl sm:text-5xl text-white">
                                    ${metrics.totalSales.toLocaleString('es-CO')}
                                </h3>
                                <p className="text-[11px] font-bold text-green-400 mt-4 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded-full">+12.5% vs mes pasado</p>
                            </div>

                            <div className="bg-black/40 border border-white/5 p-8 rounded-xl shadow-lg flex flex-col items-center justify-center py-14 text-center relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-5 border border-blue-500/20 shadow-lg shadow-blue-500/5 group-hover:scale-110 transition-transform">
                                    <Box size={32} />
                                </div>
                                <p className="text-neutral-400 uppercase tracking-widest text-xs mb-3 font-bold">Artículos Vendidos</p>
                                <h3 className="font-heading text-4xl sm:text-5xl text-white">
                                    {metrics.itemsSold.toLocaleString('es-CO')}
                                </h3>
                                <p className="text-[11px] font-bold text-blue-400 mt-4 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">+5.0% vs mes pasado</p>
                            </div>

                        </div>

                        <div className="bg-black/40 border border-white/5 rounded-xl shadow-lg overflow-hidden">
                            <div className="bg-black/20 p-5 border-b border-white/5">
                                <h3 className="font-heading text-lg text-white uppercase tracking-widest">Actividad Reciente</h3>
                            </div>
                            <div className="p-16 text-center text-neutral-500 uppercase tracking-widest text-xs flex flex-col items-center gap-3">
                                <BarChart3 size={48} className="text-neutral-800" />
                                <p>Herramientas de análisis en desarrollo... ⏳</p>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
}
