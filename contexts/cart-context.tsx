'use client';

import type React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  thumbnailUrl: string;
  instructor: {
    name: string;
    avatar: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
  isInCart: (itemId: string) => boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  setCartItems: (items: CartItem[]) => void;
  setPendingCourseIds: (courseIds: string[]) => void;
  getPendingCourseIds: () => string[];
  clearPendingCourseIds: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Carregar carrinho do localStorage ao inicializar
  useEffect(() => {
    const savedCart = localStorage.getItem('cart_items');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage sempre que items mudar
  useEffect(() => {
    localStorage.setItem('cart_items', JSON.stringify(items));
  }, [items]);

  const addToCart = (item: CartItem) => {
    setItems((prevItems) => {
      // Verificar se o item já está no carrinho
      if (prevItems.some((cartItem) => cartItem.id === item.id)) {
        return prevItems; // Não adicionar duplicatas
      }
      return [...prevItems, item];
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price, 0);
  };

  const getTotalItems = () => {
    return items.length;
  };

  const isInCart = (itemId: string) => {
    return items.some((item) => item.id === itemId);
  };

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Função para setar múltiplos itens de uma vez (usado para links parametrizados)
  const setCartItems = (newItems: CartItem[]) => {
    setItems(newItems);
  };

  // Funções para gerenciar IDs de cursos pendentes (para quando o usuário não está logado)
  const setPendingCourseIds = (courseIds: string[]) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pending_cart_course_ids', JSON.stringify(courseIds));
    }
  };

  const getPendingCourseIds = (): string[] => {
    if (typeof window !== 'undefined') {
      const pending = localStorage.getItem('pending_cart_course_ids');
      if (pending) {
        try {
          return JSON.parse(pending);
        } catch {
          return [];
        }
      }
    }
    return [];
  };

  const clearPendingCourseIds = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pending_cart_course_ids');
    }
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isInCart,
    isOpen,
    openCart,
    closeCart,
    setCartItems,
    setPendingCourseIds,
    getPendingCourseIds,
    clearPendingCourseIds,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
