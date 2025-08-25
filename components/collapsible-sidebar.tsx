'use client';

import * as React from 'react';
import { LayoutGrid, ChevronLeft, ChevronRight, BookOpen, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { useRouter, usePathname } from 'next/navigation';
import { MobileHeader } from './mobile-header';

interface SidebarProps {
  className?: string;
  onToggle?: (isCollapsed: boolean) => void;
}

function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  const [isMobileOpen, setIsMobileOpen] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-mobile-open');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  React.useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  React.useEffect(() => {
    localStorage.setItem('sidebar-mobile-open', JSON.stringify(isMobileOpen));
  }, [isMobileOpen]);

  return {
    isCollapsed,
    setIsCollapsed,
    isMobileOpen,
    setIsMobileOpen,
  };
}

export function CollapsibleSidebar({ className, onToggle }: SidebarProps) {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebarState();
  const { user, logout } = useAuth();
  const { getTotalItems } = useCart();
  const router = useRouter();
  const pathname = usePathname();

  const handleToggle = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onToggle?.(newCollapsedState);
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMobileOpen(false);
  };

  const handleCartClick = () => {
    if (pathname === '/aluno/comprar-cursos') {
      router.push('/aluno/comprar-cursos');
    } else {
      handleNavigation('/aluno/comprar-cursos');
    }
  };

  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileOpen]);

  const getMenuItems = () => {
    if (user?.role === 'ADMIN') {
      return [
        { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', path: '/admin' },
        { id: 'cursos', icon: BookOpen, label: 'Cursos', path: '/admin/cursos' },
      ];
    } else if (user?.role === 'STUDENT') {
      return [
        { id: 'dashboard', icon: LayoutGrid, label: 'Dashboard', path: '/aluno' },
        { id: 'meus-cursos', icon: BookOpen, label: 'Meus Cursos', path: '/aluno/meus-cursos' },
        {
          id: 'comprar-cursos',
          icon: ShoppingCart,
          label: 'Comprar Cursos',
          path: '/aluno/comprar-cursos',
          badge: getTotalItems() > 0 ? getTotalItems() : undefined,
        },
        { id: 'perfil', icon: User, label: 'Perfil', path: '/aluno/perfil' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  const getActiveItem = () => {
    const currentItem = menuItems.find((item) => item.path === pathname);
    return currentItem?.id || 'dashboard';
  };

  const activeItem = getActiveItem();

  return (
    <>
      <MobileHeader onMenuToggle={handleMobileToggle} />

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-45 md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          'hidden md:flex fixed left-4 top-4 bottom-4 flex-col bg-[#2D2D2D] text-white transition-all duration-500 ease-in-out rounded-2xl shadow-2xl z-50',
          isCollapsed ? 'w-16' : 'w-64',
          className
        )}
      >
        {/* Desktop Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-3 top-6 z-10 h-6 w-6 rounded-full bg-[#2D2D2D] border-2 border-gray-50 shadow-lg cursor-pointer"
          onClick={handleToggle}
        >
          {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </Button>

        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-4">
          {!isCollapsed && (
            <div className="ml-3">
              <span className="text-lg font-semibold">LOGO</span>
              <div className="text-xs text-gray-400">
                {user?.role === 'STUDENT' ? 'Área do aluno' : 'Área do admin'}
              </div>
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isCartItem = item.id === 'comprar-cursos';

            return (
              <button
                key={item.id}
                onClick={() => (isCartItem ? handleCartClick() : handleNavigation(item.path))}
                className={cn(
                  'w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors duration-200 cursor-pointer relative',
                  isActive ? 'bg-gray-500 text-white' : 'text-white hover:bg-gray-500 hover:text-white',
                  isCollapsed ? 'justify-center' : 'justify-start'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className={cn(
                      'ml-auto h-5 min-w-5 px-1.5 text-xs flex items-center justify-center',
                      isCollapsed && 'absolute -top-1 -right-1'
                    )}
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 pb-6 pt-4 space-y-1">
          {!isCollapsed && (
            <div className="mt-4 pt-4 ">
              <div className="px-3 py-2 text-xs text-gray-400">
                <div className="font-medium text-white truncate">{user?.name}</div>
                <div className="truncate">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 text-red-300 hover:bg-red-900/20 hover:text-red-200 mt-2"
              >
                <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                  />
                </svg>
                <span className="ml-3 text-sm font-medium">Sair</span>
              </button>
            </div>
          )}

          {isCollapsed && (
            <button
              onClick={logout}
              className="w-full flex items-center justify-center px-3 py-3 rounded-lg text-left transition-colors duration-200 text-red-300 hover:bg-red-900/20 hover:text-red-200"
              title="Sair"
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#2D2D2D] text-white transform transition-transform duration-300 ease-in-out md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-center h-16 px-4 mt-14">
          <div className="text-center">
            <span className="text-lg font-semibold">LOGO</span>
            <div className="text-xs text-gray-400">{user?.role === 'STUDENT' ? 'Área do aluno' : 'Área do admin'}</div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;
            const isCartItem = item.id === 'comprar-cursos';

            return (
              <button
                key={item.id}
                onClick={() => (isCartItem ? handleCartClick() : handleNavigation(item.path))}
                className={cn(
                  'w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors duration-200 cursor-pointer relative',
                  isActive ? 'bg-gray-500 text-white' : 'text-white hover:bg-gray-500 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 text-sm font-medium">{item.label}</span>
                {item.badge && (
                  <Badge
                    variant="destructive"
                    className="ml-auto h-5 min-w-5 px-1.5 text-xs flex items-center justify-center"
                  >
                    {item.badge}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Bottom Navigation */}
        <div className="px-3 pb-6 pt-4 space-y-1">
          <div className="mt-4 pt-4">
            <div className="px-3 py-2 text-xs text-gray-400">
              <div className="font-medium text-white truncate">{user?.name}</div>
              <div className="truncate">{user?.email}</div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 text-red-300 hover:bg-red-900/20 hover:text-red-200 mt-2"
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1"
                />
              </svg>
              <span className="ml-3 text-sm font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
