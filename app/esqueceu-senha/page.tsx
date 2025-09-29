'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Shield, ArrowLeft, Clock, Check, X } from 'lucide-react';
import ImageSlider from '@/components/image-slider';
import { apiService } from '@/lib/api';
import { useToast } from '@/contexts/toast-context';
import Image from 'next/image';
import { useTheme } from 'next-themes';

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutos em segundos
  const [isTimerActive, setIsTimerActive] = useState(false);
  const router = useRouter();
  const { success, error: showError } = useToast();
  const { theme, setTheme } = useTheme();

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });

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

  // Timer para expiração do código
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerActive(false);
      showError('Código expirado! Solicite um novo código.');
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, showError]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await apiService.requestPasswordReset(email);
      if (response.success) {
        success('Código enviado para seu email!');
        setCurrentStep(2);
        setTimeLeft(600); // Reset timer
        setIsTimerActive(true);
      } else {
        showError(response.error || 'Erro ao enviar código. Tente novamente.');
      }
    } catch (error) {
      showError('Erro ao enviar código. Tente novamente.');
    }

    setIsLoading(false);
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus próximo input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      showError('Digite todos os 6 dígitos do código.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.verifyResetCode(email, fullCode);
      if (response.success) {
        success('Código válido!');
        setCurrentStep(3);
        setIsTimerActive(false);
      } else {
        showError('Código inválido ou expirado. Tente novamente.');
      }
    } catch (error) {
      showError('Erro ao verificar código. Tente novamente.');
    }

    setIsLoading(false);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showError('As senhas não coincidem!');
      return;
    }

    const isPasswordStrong = Object.values(passwordValidation).every(Boolean);
    if (!isPasswordStrong) {
      showError('A senha deve atender a todos os critérios de segurança!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.resetPassword(email, code.join(''), newPassword);
      if (response.success) {
        success('Senha alterada com sucesso!');
        const originalTheme = localStorage.getItem('originalTheme');
        if (originalTheme) {
          setTheme(originalTheme);
          localStorage.removeItem('originalTheme');
        }
        router.push('/login');
      } else {
        showError(response.error || 'Erro ao alterar senha. Tente novamente.');
      }
    } catch (error) {
      showError('Erro ao alterar senha. Tente novamente.');
    }

    setIsLoading(false);
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.requestPasswordReset(email);
      if (response.success) {
        success('Novo código enviado!');
        setTimeLeft(600);
        setIsTimerActive(true);
        setCode(['', '', '', '', '', '']);
      } else {
        showError('Erro ao reenviar código.');
      }
    } catch (error) {
      showError('Erro ao reenviar código.');
    }
    setIsLoading(false);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep ? 'bg-[#121F3F] text-white' : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step}
          </div>
          {step < 3 && <div className={`w-12 h-0.5 mx-2 ${step < currentStep ? 'bg-[#121F3F]' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <form onSubmit={handleEmailSubmit} className="space-y-4">
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

      <Button
        type="submit"
        className="w-full h-10 md:h-12 bg-[#121F3F] hover:bg-gray-800 text-white font-medium text-sm md:text-base"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Enviando...</span>
          </div>
        ) : (
          'Enviar código'
        )}
      </Button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleCodeSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Digite o código</h2>
        <p className="text-sm text-gray-600 mb-4">
          Enviamos um código de 6 dígitos para <strong>{email}</strong>
        </p>

        {isTimerActive && (
          <div className="flex items-center justify-center space-x-2 text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-2">
            <Clock className="w-4 h-4" />
            <span>Código expira em: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-2 mb-4">
        {code.map((digit, index) => (
          <Input
            key={index}
            id={`code-${index}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleCodeChange(index, e.target.value)}
            className="w-12 h-12 text-center text-lg font-semibold"
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !digit && index > 0) {
                const prevInput = document.getElementById(`code-${index - 1}`);
                prevInput?.focus();
              }
            }}
          />
        ))}
      </div>

      <Button
        type="submit"
        className="w-full h-10 md:h-12 bg-[#121F3F] hover:bg-gray-800 text-white font-medium text-sm md:text-base"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Verificando...</span>
          </div>
        ) : (
          'Verificar código'
        )}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendCode}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          disabled={isLoading || isTimerActive}
        >
          {isTimerActive ? 'Aguarde para reenviar' : 'Reenviar código'}
        </button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handlePasswordSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Nova senha</h2>
        <p className="text-sm text-gray-600">Crie uma senha forte para sua conta</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-sm md:text-base">
          Nova senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            placeholder="Digite sua nova senha"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              validatePassword(e.target.value);
            }}
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

        {newPassword && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${passwordValidation.length ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs ${passwordValidation.length ? 'text-green-600' : 'text-red-600'}`}>
                Pelo menos 8 caracteres
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${passwordValidation.uppercase ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs ${passwordValidation.uppercase ? 'text-green-600' : 'text-red-600'}`}>
                Uma letra maiúscula
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${passwordValidation.lowercase ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs ${passwordValidation.lowercase ? 'text-green-600' : 'text-red-600'}`}>
                Uma letra minúscula
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${passwordValidation.number ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs ${passwordValidation.number ? 'text-green-600' : 'text-red-600'}`}>
                Um número
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${passwordValidation.special ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={`text-xs ${passwordValidation.special ? 'text-green-600' : 'text-red-600'}`}>
                Um caractere especial
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm md:text-base">
          Confirmar nova senha
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirme sua nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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

        {confirmPassword && (
          <div className="mt-2">
            <div className="flex items-center space-x-2">
              {newPassword === confirmPassword ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-600">As senhas coincidem</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-red-600">As senhas não coincidem</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-1">Dicas de Segurança</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Use uma combinação de letras, números e símbolos</li>
              <li>• Evite informações pessoais óbvias</li>
              <li>• Não reutilize senhas de outras contas</li>
              <li>• Considere usar um gerenciador de senhas</li>
            </ul>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-10 md:h-12 bg-[#121F3F] hover:bg-gray-800 text-white font-medium text-sm md:text-base"
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Alterando senha...</span>
          </div>
        ) : (
          'Alterar senha'
        )}
      </Button>
    </form>
  );

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
        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Recuperar senha</h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">Digite seu email para receber o código de recuperação</p>
          </div>

          <Card className="shadow-xl border-0">
            <CardContent className="px-4 md:px-6">
              {renderStepIndicator()}

              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              <div className="text-center mt-4 md:mt-6">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar ao login</span>
                </Link>
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
