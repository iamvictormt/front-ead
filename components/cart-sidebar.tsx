'use client';

import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ShoppingBag, Trash2, CreditCard } from 'lucide-react';
import Image from 'next/image';

export function CartSidebar() {
  const { items, removeFromCart, clearCart, getTotalPrice, getTotalItems, isOpen, closeCart } = useCart();

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(price);
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={closeCart} />

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Carrinho</h2>
            {getTotalItems() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getTotalItems()}
              </Badge>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={closeCart} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Carrinho vazio</h3>
              <p className="text-muted-foreground text-sm">Adicione cursos ao seu carrinho para começar</p>
            </div>
          </div>
        ) : (
          <>
            {/* Items List */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-lg border bg-card">
                    <div className="relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.thumbnailUrl || '/placeholder.svg'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{item.instructor.name}</p>
                      <p className="font-semibold text-sm text-primary">{formatPrice(item.price)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">{formatPrice(getTotalPrice())}</span>
              </div>

              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Finalizar Compra
                </Button>
                <Button variant="outline" className="w-full bg-transparent" onClick={clearCart}>
                  Limpar Carrinho
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
