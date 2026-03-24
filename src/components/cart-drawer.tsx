"use client";

import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

export default function CartDrawer() {
    const { items, isCartOpen, toggleCart, removeItem, addItem, deleteItem, totalPrice } = useCart();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={toggleCart}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-[100dvh] w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-black/5">
                            <h2 className="font-heading text-2xl tracking-widest text-brand-black">TU CARRITO</h2>
                            <button
                                onClick={toggleCart}
                                className="p-2 hover:bg-black/5 rounded-full transition-colors text-brand-black"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                                    <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center text-brand-black/20">
                                        <Trash2 size={40} className="ml-2" /> {/* Or simple cart icon */}
                                    </div>
                                    <p className="font-heading text-xl text-brand-black/50 tracking-widest uppercase">Tu carrito está vacío</p>
                                    <button
                                        onClick={toggleCart}
                                        className="mt-4 px-8 py-3 bg-brand-black text-white text-sm font-bold tracking-widest uppercase hover:bg-brand-red transition-colors"
                                    >
                                        Seguir Comprando
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-center">
                                            {/* Image */}
                                            <div className="relative w-24 h-24 bg-brand-bg rounded-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 flex flex-col justify-between h-24 py-1">
                                                <div>
                                                    <h3 className="text-sm font-bold text-brand-black uppercase tracking-widest line-clamp-1">{item.name}</h3>
                                                    <p className="text-[10px] text-brand-black/50 uppercase tracking-widest">{item.brand}</p>
                                                </div>

                                                <div className="flex items-center justify-between mt-auto">
                                                    {/* Quantity Controls */}
                                                    <div className="flex items-center border border-black/10 rounded-sm">
                                                        <button 
                                                            onClick={() => removeItem(item.id)}
                                                            className="w-8 h-8 flex items-center justify-center text-brand-black hover:bg-black/5"
                                                        >
                                                            <Minus size={14} />
                                                        </button>
                                                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                        <button 
                                                            onClick={() => addItem(item)}
                                                            className="w-8 h-8 flex items-center justify-center text-brand-black hover:bg-black/5"
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                    </div>

                                                    {/* Price */}
                                                    <p className="text-sm font-medium">
                                                        ${item.onSale && item.salePrice ? item.salePrice : item.price}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Delete Action */}
                                            <button 
                                                onClick={() => deleteItem(item.id)}
                                                className="p-2 mt-1 self-start text-brand-black/20 hover:text-brand-red transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer (Total & Checkout) */}
                        {items.length > 0 && (
                            <div className="border-t border-black/5 p-6 bg-brand-bg/50">
                                <div className="flex justify-between items-center mb-6 text-brand-black">
                                    <span className="font-heading text-xl uppercase tracking-widest">Total</span>
                                    <span className="text-xl font-bold">${totalPrice.toFixed(2)} COP</span>
                                </div>
                                <button
                                    onClick={() => alert("Proceeding to WhatsApp or Checkout...")}
                                    className="w-full bg-brand-red text-white py-4 text-sm font-bold tracking-[0.2em] uppercase hover:bg-brand-black transition-colors"
                                >
                                    CHECKOUT
                                </button>
                                <p className="text-[10px] text-center mt-3 text-brand-black/40 uppercase tracking-widest">
                                    Impuestos incluidos. Envío calculado en el checkout.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
