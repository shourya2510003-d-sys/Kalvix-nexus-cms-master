'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  price: number;
  compareAtPrice?: number;
  name: string;
  sku: string;
  image?: string;
  variantTitle: string;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { token } = useAuth();

  // Load from local storage initially
  useEffect(() => {
    const localCart = localStorage.getItem('kalvix_cart');
    if (localCart) {
      setCart(JSON.parse(localCart));
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem('kalvix_cart', JSON.stringify(cart));
  }, [cart]);

  // Sync with API when token is loaded
  useEffect(() => {
    if (token && cart.length > 0) {
      fetch(`${'https://kalvix-nexus-production.up.railway.app/api'}/orders/cart/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        }),
      }).catch(console.error);
    }
  }, [token, cart]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.variantId === item.variantId);
      if (existing) {
        return prev.map((i) =>
          i.variantId === item.variantId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, { ...item, id: `${item.variantId}-${Date.now()}` }];
    });
  };

  const removeItem = (variantId: string) => {
    setCart((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, cartCount, cartTotal, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
