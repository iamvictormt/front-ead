import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { ToastProvider } from '@/contexts/toast-context';
import { CartProvider } from '@/contexts/cart-context';
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'IMDN - Instituto de Marketing Digital e Negócios',
  description: 'Plataforma de cursos online do IMDN - Instituto de Marketing Digital e Negócios.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ToastProvider>
              <SidebarProvider>
                <CartProvider>{children}</CartProvider>
              </SidebarProvider>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
