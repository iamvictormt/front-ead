'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import ImageSlider from '@/components/image-slider';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/contexts/toast-context';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const { login, isLoading } = useAuth();
  const [loginError, setLoginError] = useState('');
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (theme && theme !== 'light') {
      localStorage.setItem('originalTheme', theme);
    }
    setTheme('light');

    return () => {
      const originalTheme = localStorage.getItem('originalTheme');
      if (originalTheme) {
        setTheme(originalTheme);
        localStorage.removeItem('originalTheme');
      }
    };
  }, [theme, setTheme]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const result = await login(email, password);

    if (result.success) {
      const originalTheme = localStorage.getItem('originalTheme');
      if (originalTheme) {
        setTheme(originalTheme);
        localStorage.removeItem('originalTheme');
      }
      router.push('/');
      success('Login realizado com sucesso!', 'Bem-vindo');
    } else {
      showError(result.error || 'Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen flex" data-theme="light">
      <div className="hidden lg:block lg:w-1/2">
        <ImageSlider />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center justify-center w-[30%] h-[30%] md-w-full md-h-full rounded-2xl mb-8 md:mb-12">
              <Image src="/logo-vertical.png" alt="Logo" width={320} height={420} className="w-full h-full" />
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Bem-vindo de volta</h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Entre na sua conta para continuar</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="px-4 md:px-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm md:text-base">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 md:h-12 text-sm md:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm md:text-base">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 md:h-12 text-sm md:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Lembrar de mim
                    </Label>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium text-left sm:text-right"
                  >
                    Esqueceu a senha?
                  </button>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 md:h-12 bg-[#121F3F] hover:bg-gray-800 text-white font-medium text-sm md:text-base cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Entrando...</span>
                    </div>
                  ) : (
                    'Entrar'
                  )}
                </Button>
              </form>

              {loginError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{loginError}</p>
                </div>
              )}

              <div className="text-center mt-4 md:mt-6">
                <p className="text-sm text-gray-600">
                  Não tem uma conta?{' '}
                  <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                    Cadastre-se
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="text-center mt-6 md:mt-8 text-xs md:text-sm text-gray-500">
            <p>© {new Date().getFullYear()} IMDN. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
