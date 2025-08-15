'use client';

import * as React from 'react';
import {
  Box,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  BookOpen,
  ShoppingCart,
  User,
  NotebookText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useSidebar } from '@/contexts/sidebar-context';

interface SidebarProps {
  className?: string;
  onToggle?: (isCollapsed: boolean) => void;
}

export function CollapsibleSidebar({ className, onToggle }: SidebarProps) {
  const { isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen } = useSidebar();
  const { user, logout } = useAuth();
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

  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'; // trava o scroll
    } else {
      document.body.style.overflow = ''; // volta ao normal
    }
  }, [isMobileOpen]);

  // Menu items baseado no role do usuário
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
        { id: 'comprar-cursos', icon: ShoppingCart, label: 'Comprar Cursos', path: '/aluno/comprar-cursos' },
        { id: 'perfil', icon: User, label: 'Perfil', path: '/aluno/perfil' },
      ];
    }
    return [];
  };

  const menuItems = getMenuItems();

  // Determinar item ativo baseado na URL atual
  const getActiveItem = () => {
    const currentItem = menuItems.find((item) => item.path === pathname);
    return currentItem?.id || '';
  };

  const activeItem = getActiveItem();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className='py-4 px-2 top-[-2px] fixed z-50 md:hidden '>
        <Button
          variant="ghost"
          size="icon"
          className=" h-10 w-10 bg-[#2D2D2D] text-white"
          onClick={handleMobileToggle}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black opacity-90 z-41 md:hidden" onClick={() => setIsMobileOpen(false)} />
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
          <NotebookText className="h-6 w-6 text-white" />
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

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors duration-200 cursor-pointer',
                  isActive ? 'bg-gray-500 text-white' : 'text-white hover:bg-gray-500 hover:text-white',
                  isCollapsed ? 'justify-center' : 'justify-start'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Navigation */}
        <div className="px-3 pb-6 pt-4 space-y-1">
          {/* <button
            onClick={() => handleNavigation(`/${user?.role?.toLowerCase()}/configuracoes`)}
            className={cn(
              'w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors duration-200',
              pathname?.includes('/configuracoes')
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white',
              isCollapsed ? 'justify-center' : 'justify-start'
            )}
            title={isCollapsed ? 'Configurações' : undefined}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3 text-sm font-medium">Configurações</span>}
          </button> */}

          {/* User Info and Logout */}
          {!isCollapsed && (
            <div className="mt-4 pt-4 ">
              <div className="px-3 py-2 text-xs text-gray-400">
                <div className="font-medium text-white truncate">{user?.name}</div>
                <div className="truncate">{user?.email}</div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors duration-200 text-red-300 hover:bg-red-900/20 hover:text-red-200 mt-2 cursor-pointer"
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
              className="w-full flex items-center justify-center px-3 py-3 rounded-lg text-left transition-colors duration-200 text-red-300 hover:bg-red-900/20 hover:text-red-200 cursor-pointer"
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
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#2D2D2D] text-white transform transition-transform duration-100 ease-in-out md:hidden',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo/Brand */}
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <NotebookText className="h-6 w-6 text-white" />
            <div className="ml-3">
              <span className="text-lg font-semibold">LOGO</span>
              <div className="text-xs text-gray-400">
                {user?.role === 'STUDENT' ? 'Área do aluno' : 'Área do admin'}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="text-white hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Mobile Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={cn(
                  'w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors duration-200 cursor-pointer justify-start',
                  isActive ? 'bg-gray-500 text-white' : 'text-white hover:bg-gray-500 hover:text-white'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span className="ml-3 text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Mobile Bottom Navigation */}
        <div className="px-3 pb-6 pt-4 space-y-1">
          {/* <button
            onClick={() => handleNavigation(`/${user?.role?.toLowerCase()}/configuracoes`)}
            className={cn(
              'w-full flex items-center px-3 py-3 rounded-lg text-left transition-colors duration-200',
              pathname?.includes('/configuracoes')
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            )}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span className="ml-3 text-sm font-medium">Configurações</span>
          </button> */}

          {/* Mobile User Info and Logout */}
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
