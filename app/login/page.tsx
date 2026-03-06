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

  const { login, isLoading, user } = useAuth();
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

      const pendingAction: any = JSON.parse(localStorage.getItem('pendingAction') || 'null');
      if (pendingAction) {
        router.push(`/detalhes-curso/${pendingAction.courseId}` || '/');
        localStorage.removeItem('pendingAction');
      } else {
        if (result.role === 'STUDENT') {
          router.push('/aluno');
        } else {
          router.push('/admin');
        }
      }
      success('Login realizado com sucesso!', 'Bem-vindo');
    } else {
      showError(result.error || 'Erro ao fazer login. Tente novamente.');
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-8 relative overflow-hidden" 
      data-theme="light"
    >
      {/* Background decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100" />
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-slate-200/50 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-32 h-auto rounded-2xl mb-6">
            <Image src="/logo-vertical.png" alt="Logo" width={320} height={420} className="w-full h-full" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bem-vindo de volta</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Entre na sua conta para continuar</p>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm md:text-base font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 text-sm md:text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm md:text-base font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11 h-12 text-sm md:text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">
                    Lembrar de mim
                  </Label>
                </div>

                <Link
                  href="/esqueceu-senha"
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Esqueceu a senha?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#121F3F] hover:bg-[#1a2d5c] text-white font-medium text-sm md:text-base cursor-pointer transition-all shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link href="/registrar" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8 text-xs md:text-sm text-gray-500">
          <p>© {new Date().getFullYear()} IMDN. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
