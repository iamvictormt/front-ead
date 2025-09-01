'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import ImageSlider from '@/components/image-slider';
import { apiService } from '@/lib/api';
import { useToast } from '@/contexts/toast-context';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { theme, setTheme } = useTheme();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      showError('As senhas não coincidem!');
      setIsLoading(false);
      return;
    }

    if (!acceptTerms) {
      showError('Você deve aceitar os termos e condições!');
      setIsLoading(false);
      return;
    }

    const response = await apiService.createUser(formData);

    if (response.success) {
      const originalTheme = localStorage.getItem('originalTheme');
      if (originalTheme) {
        setTheme(originalTheme);
        localStorage.removeItem('originalTheme');
      }
      success('Usuário criado com sucesso!');
      router.push('/');
    } else {
      showError(response.error || 'Erro ao criar usuário. Tente novamente.');
    }

    setIsLoading(false);
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Crie sua conta</h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Junte-se a nós e comece sua jornada</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="px-4 md:px-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm md:text-base">
                    Nome completo
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10 h-10 md:h-12 text-sm md:text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm md:text-base">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
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
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={handleInputChange}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm md:text-base">
                    Confirmar senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-10 pr-10 h-10 md:h-12 text-sm md:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-sm text-gray-600 leading-relaxed">
                    Eu aceito os{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-800 font-medium">
                      Termos de Uso
                    </button>{' '}
                    e a{' '}
                    <button type="button" className="text-blue-600 hover:text-blue-800 font-medium">
                      Política de Privacidade
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-10 md:h-12 bg-[#121F3F] hover:bg-gray-800 text-white font-medium text-sm md:text-base cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Criando conta...</span>
                    </div>
                  ) : (
                    'Criar conta'
                  )}
                </Button>
              </form>

              <div className="text-center mt-4 md:mt-6">
                <p className="text-sm text-gray-600">
                  Já tem uma conta?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                    Faça login
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
