"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
// We'll import Product type if/when we have a shared types file. For now we use a local interface.

export interface Product {
    id: string | number;
    name: string;
    brand: string;
    price: number;
    image: string;
    trending?: boolean;
    onSale?: boolean;
    salePrice?: number;
}

export interface CartItem extends Product {
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: string | number) => void;
    deleteItem: (productId: string | number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Initial load from localStorage
    useEffect(() => {
        const savedCart = localStorage.getItem("highhood_cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    // Save to localStorage on items change
    useEffect(() => {
        localStorage.setItem("highhood_cart", JSON.stringify(items));
    }, [items]);

    const addItem = (product: Product) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
        setIsCartOpen(true); // Automatically open cart when adding
    };

    const removeItem = (productId: string | number) => {
        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === productId);
            if (existingItem && existingItem.quantity > 1) {
                return prevItems.map((item) =>
                    item.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prevItems.filter((item) => item.id !== productId);
        });
    };

    const deleteItem = (productId: string | number) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== productId));
    };

    const clearCart = () => {
        setItems([]);
    };

    const toggleCart = () => {
        setIsCartOpen((prev) => !prev);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
        (sum, item) => sum + (item.onSale && item.salePrice ? item.salePrice : item.price) * item.quantity,
        0
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                deleteItem,
                clearCart,
                totalItems,
                totalPrice,
                isCartOpen,
                toggleCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
