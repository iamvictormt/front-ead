'use client';

import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, ShoppingBag, Trash2, CreditCard } from 'lucide-react';
import Image from 'next/image';
import { formatKwanza } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function CartSidebar() {
  const { items, removeFromCart, clearCart, getTotalPrice, getTotalItems, isOpen, closeCart } = useCart();
  const router = useRouter();

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push('/aluno/carrinho');
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={closeCart} />

      {/* Sidebar */}
      <div
        className={`
        fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        flex flex-col
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary dark:text-blue-400" />
            <h2 className="text-lg font-semibold dark:text-white">Carrinho</h2>
            {getTotalItems() > 0 && (
              <Badge variant="secondary" className="ml-2 dark:bg-gray-700 dark:text-gray-300">
                {getTotalItems()}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={closeCart}
            className="h-8 w-8 p-0 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground dark:text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 dark:text-white">Carrinho vazio</h3>
              <p className="text-muted-foreground dark:text-gray-300 text-sm">
                Adicione cursos ao seu carrinho para começar
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Items List */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-3 p-3 rounded-lg border dark:border-gray-700 bg-card dark:bg-gray-900"
                  >
                    <div className="relative w-16 h-12 rounded-md overflow-hidden flex-shrink-0">
                      <Image
                        src={item.thumbnailUrl || '/placeholder.svg'}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm line-clamp-2 mb-1 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-muted-foreground dark:text-gray-400 mb-2">{item.instructor.name}</p>
                      <p className="font-semibold text-sm text-primary dark:text-blue-400">
                        {formatKwanza(item.price)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                      className="h-8 w-8 p-0 text-muted-foreground dark:text-gray-400 hover:text-destructive dark:hover:text-red-400 dark:hover:bg-gray-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t dark:border-gray-700 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold dark:text-white">Total:</span>
                <span className="text-xl font-bold text-primary dark:text-blue-400">
                  {formatKwanza(getTotalPrice())}
                </span>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"
                  size="lg"
                  onClick={() => {
                    // Verificar se usuário está logado
                    const user = JSON.parse(localStorage.getItem('user') || 'null');
                    if (!user) {
                      // Salvar carrinho e redirecionar para login
                      localStorage.setItem(
                        'pendingAction',
                        JSON.stringify({
                          type: 'checkout',
                          returnUrl: '/comprar-cursos',
                        })
                      );
                      window.location.href = '/login';
                    } else {
                      handleCheckout();
                    }
                  }}
                >
                  <CreditCard className="h-4 w-4 mr-1" />
                  Finalizar Compra
                </Button>
                <Button
                  variant="outline"
                  className="w-full bg-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                  onClick={clearCart}
                >
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
