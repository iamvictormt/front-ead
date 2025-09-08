'use client';

import { Menu, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/cart-context';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';

interface MobileHeaderProps {
  onMenuToggle: () => void;
  title?: string;
}

export function MobileHeader({ onMenuToggle, title }: MobileHeaderProps) {
  const { getTotalItems, openCart } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleCartClick = () => {
    if (pathname === '/aluno/comprar-cursos') {
      openCart();
    } else {
      router.push('/aluno/comprar-cursos');
    }
  };

  const getPageTitle = () => {
    if (title) return title;

    switch (pathname) {
      case '/aluno':
        return 'Dashboard';
      case '/aluno/meus-cursos':
        return 'Meus Cursos';
      case '/aluno/comprar-cursos':
        return 'Comprar Cursos';
      case '/aluno/perfil':
        return 'Perfil';
      case '/admin':
        return 'Dashboard Admin';
      case '/admin/cursos':
        return 'Gerenciar Cursos';
      case '/admin/cursos/novo':
        return 'Cadastrar Curso';
      case `/admin/cursos/editar/${pathname.split('/').pop()}`:
        return 'Editar Curso';
      case '/admin/alunos':
        return 'Gerenciar Alunos';
      default:
        return 'LOGO';
    }
  };

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 shadow-md h-14">
      <div className="flex items-center justify-between h-full px-4">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="h-10 w-10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Page Title */}
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{getPageTitle()}</h1>

        {/* Cart Button - Only for students */}
        {user?.role === 'STUDENT' ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCartClick}
            className="h-10 w-10 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 relative"
          >
            <ShoppingCart className="h-5 w-5" />
            {getTotalItems() > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {getTotalItems()}
              </Badge>
            )}
          </Button>
        ) : (
          <div className="w-10" /> // Spacer for alignment
        )}
      </div>
    </header>
  );
}
