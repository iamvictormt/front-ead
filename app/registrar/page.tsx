"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, Shield, Check, X } from "lucide-react"
import { apiService } from "@/lib/api"
import { useToast } from "@/contexts/toast-context"
import Image from "next/image"
import { useTheme } from "next-themes"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const router = useRouter()
  const { success, error: showError } = useToast()
  const { theme, setTheme } = useTheme()

  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  })

  useEffect(() => {
    if (theme && theme !== "light") {
      localStorage.setItem("originalTheme", theme)
    }
    setTheme("light")

    return () => {
      const originalTheme = localStorage.getItem("originalTheme")
      if (originalTheme) {
        setTheme(originalTheme)
        localStorage.removeItem("originalTheme")
      }
    }
  }, [theme, setTheme])

  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (name === "password") {
      validatePassword(value)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      showError("As senhas não coincidem!")
      setIsLoading(false)
      return
    }

    if (!acceptTerms) {
      showError("Você deve aceitar os termos e condições!")
      setIsLoading(false)
      return
    }

    const isPasswordStrong = Object.values(passwordValidation).every(Boolean)
    if (!isPasswordStrong) {
      showError("A senha deve atender a todos os critérios de segurança!")
      setIsLoading(false)
      return
    }

    const response = await apiService.createUser(formData)

    if (response.success) {
      const originalTheme = localStorage.getItem("originalTheme")
      if (originalTheme) {
        setTheme(originalTheme)
        localStorage.removeItem("originalTheme")
      }
      success("Usuário criado com sucesso!")
      router.push("/")
    } else {
      showError(response.error || "Erro ao criar usuário. Tente novamente.")
    }

    setIsLoading(false)
  }

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

      <div className="w-full max-w-xl relative z-10 py-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-28 h-auto rounded-2xl mb-4">
            <Image src="/logo-vertical.png" alt="Logo" width={320} height={420} className="w-full h-full" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Crie sua conta</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Junte-se a nós e comece sua jornada</p>
        </div>

        <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/90">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm md:text-base font-medium">
                  Nome completo
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="pl-11 h-12 text-sm md:text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm md:text-base font-medium">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-11 h-12 text-sm md:text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm md:text-base font-medium">
                    Senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Digite sua senha"
                      value={formData.password}
                      onChange={handleInputChange}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm md:text-base font-medium">
                    Confirmar senha
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirme sua senha"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="pl-11 pr-11 h-12 text-sm md:text-base bg-gray-50/50 border-gray-200 focus:bg-white transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Validação de senha em grid compacto */}
              {formData.password && (
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.length ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className={`text-xs ${passwordValidation.length ? "text-green-600" : "text-gray-500"}`}>
                        8+ caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.uppercase ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className={`text-xs ${passwordValidation.uppercase ? "text-green-600" : "text-gray-500"}`}>
                        Maiúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.lowercase ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className={`text-xs ${passwordValidation.lowercase ? "text-green-600" : "text-gray-500"}`}>
                        Minúscula
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.number ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className={`text-xs ${passwordValidation.number ? "text-green-600" : "text-gray-500"}`}>
                        Número
                      </span>
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${passwordValidation.special ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      <span className={`text-xs ${passwordValidation.special ? "text-green-600" : "text-gray-500"}`}>
                        Caractere especial
                      </span>
                      {formData.confirmPassword && (
                        <span className="ml-auto flex items-center gap-1">
                          {formData.password === formData.confirmPassword ? (
                            <>
                              <Check className="w-3 h-3 text-green-500" />
                              <span className="text-xs text-green-600">Senhas coincidem</span>
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3 text-red-500" />
                              <span className="text-xs text-red-600">Senhas diferentes</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Dicas de Segurança</h4>
                    <p className="text-xs text-blue-700">
                      Use combinação de letras, números e símbolos. Evite informações pessoais e não reutilize senhas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-1">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <div className="text-sm text-gray-600 leading-relaxed">
                  Eu aceito os{" "}
                  <button type="button" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Termos de Uso
                  </button>{" "}
                  e a{" "}
                  <button type="button" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Política de Privacidade
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#121F3F] hover:bg-[#1a2d5c] text-white font-medium text-sm md:text-base cursor-pointer transition-all shadow-lg hover:shadow-xl"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Criando conta...</span>
                  </div>
                ) : (
                  "Criar conta"
                )}
              </Button>
            </form>

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">ou</span>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                  Faça login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6 text-xs md:text-sm text-gray-500">
          <p>© {new Date().getFullYear()} IMDN. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
