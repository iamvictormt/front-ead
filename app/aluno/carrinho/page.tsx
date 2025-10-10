"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Trash2,
  MessageCircle,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Shield,
  Zap,
  Info,
  Building2,
} from "lucide-react"
import Image from "next/image"
import { formatKwanza } from "@/lib/utils"

export default function CarrinhoPage() {
  const router = useRouter()
  const { items, removeFromCart, clearCart, getTotalPrice } = useCart()
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState<string>("transferencia")
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFinalizarCompra = () => {
    if (!user) {
      router.push("/login")
      return
    }

    setIsProcessing(true)

    const cursosList = items
      .map((item, index) => `${index + 1}. ${item.title} - ${formatKwanza(item.price)}`)
      .join("%0A")

    const message =
      `Olá! Gostaria de finalizar minha compra:%0A%0A` +
      `*Dados do Aluno:*%0A` +
      `Nome: ${user.name}%0A` +
      `Email: ${user.email}%0A%0A` +
      `*Cursos Selecionados:*%0A${cursosList}%0A%0A` +
      `*Valor Total: ${formatKwanza(getTotalPrice())}*%0A%0A` +
      `*Método de Pagamento:* Transferência Bancária%0A%0A` +
      `Aguardo as instruções para realizar o pagamento.`

    const whatsappUrl = `https://wa.me/447570087886?text=${message}`

    window.open(whatsappUrl, "_blank")

    setTimeout(() => {
      clearCart()
      setIsProcessing(false)
      router.push("/aluno/meus-cursos")
    }, 1000)
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <Card className="p-12 text-center dark:bg-gray-800 dark:border-gray-700">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Carrinho Vazio</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Você ainda não adicionou nenhum curso ao carrinho.
              </p>
              <Button
                onClick={() => router.push("/aluno/comprar-cursos")}
                className="bg-[#DE2535] hover:bg-[#c01f2d] dark:bg-[#DE2535] dark:hover:bg-[#c01f2d]"
              >
                Explorar Cursos
              </Button>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4 md:mb-6 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>

        <Card className="mb-6 md:mb-8 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800 border-blue-200 dark:border-gray-700">
          <div className="flex items-start gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Info className="w-5 h-5 md:w-6 md:h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-base md:text-lg text-blue-900 dark:text-blue-400 mb-2">
                Como funciona o processo de compra?
              </h3>
              <p className="text-sm md:text-base text-blue-800 dark:text-gray-300 leading-relaxed">
                Ao finalizar sua compra, você será redirecionado para o WhatsApp da IMDN. Lá, nossa equipe irá fornecer
                os dados bancários para transferência. Após confirmar o pagamento, liberaremos o acesso aos cursos
                imediatamente. Este processo temporário garante atendimento personalizado enquanto desenvolvemos o
                sistema de pagamento automático.
              </p>
            </div>
          </div>
        </Card>

        <div className="mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 dark:text-white text-center">Processo de Compra</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <Card className="p-4 md:p-6 text-center dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <ShoppingCart className="w-6 h-6 md:w-8 md:h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                1
              </div>
              <h3 className="font-bold text-sm md:text-base mb-2 dark:text-white">Revisar Pedido</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Confira os cursos selecionados e o valor total
              </p>
            </Card>

            <Card className="p-4 md:p-6 text-center dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <MessageCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                2
              </div>
              <h3 className="font-bold text-sm md:text-base mb-2 dark:text-white">Contato via WhatsApp</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Receba os dados bancários e instruções de pagamento
              </p>
            </Card>

            <Card className="p-4 md:p-6 text-center dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <Building2 className="w-6 h-6 md:w-8 md:h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="w-8 h-8 bg-yellow-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                3
              </div>
              <h3 className="font-bold text-sm md:text-base mb-2 dark:text-white">Realizar Pagamento</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Faça a transferência bancária e envie o comprovante
              </p>
            </Card>

            <Card className="p-4 md:p-6 text-center dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-red-600 dark:text-red-400" />
              </div>
              <div className="w-8 h-8 bg-[#DE2535] text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">
                4
              </div>
              <h3 className="font-bold text-sm md:text-base mb-2 dark:text-white">Acesso Liberado</h3>
              <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                Após confirmação, acesse seus cursos imediatamente
              </p>
            </Card>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h1 className="text-xl md:text-2xl font-bold dark:text-white">Carrinho de Compras</h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {items.length} {items.length === 1 ? "curso selecionado" : "cursos selecionados"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700 bg-transparent w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar Carrinho
              </Button>
            </div>

            {items.map((item) => (
              <Card
                key={item.id}
                className="p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-full sm:w-40 h-32 sm:h-24 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={item.thumbnailUrl || "/placeholder.svg"}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base md:text-lg mb-2 dark:text-white line-clamp-2">{item.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Por {item.instructor.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Acesso vitalício
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        <Zap className="w-3 h-3 mr-1" />
                        Certificado incluído
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xl md:text-2xl font-bold text-[#DE2535]">{formatKwanza(item.price)}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <Card className="p-4 md:p-6 bg-green-50 dark:bg-gray-800 border-green-200 dark:border-gray-700 lg:hidden">
              <h3 className="font-bold text-base mb-4 text-green-900 dark:text-green-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Garantias e Benefícios
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-green-800 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Acesso vitalício aos cursos adquiridos</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-green-800 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Certificado de conclusão reconhecido</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-green-800 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Suporte direto via WhatsApp</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-green-800 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Atualizações de conteúdo gratuitas</span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-4 md:p-6 dark:bg-gray-800 dark:border-gray-700 top-4">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 dark:text-white">Resumo do Pedido</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm md:text-base text-gray-600 dark:text-gray-300">
                  <span>
                    Subtotal ({items.length} {items.length === 1 ? "curso" : "cursos"})
                  </span>
                  <span className="font-medium">{formatKwanza(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Desconto</span>
                  <span className="font-medium">Kz 0,00</span>
                </div>
                <Separator className="dark:bg-gray-700" />
                <div className="flex justify-between text-base md:text-lg font-bold dark:text-white">
                  <span>Total</span>
                  <span className="text-[#DE2535] text-xl md:text-2xl">{formatKwanza(getTotalPrice())}</span>
                </div>
              </div>

              <div className="mb-2">
                <h3 className="font-semibold text-sm md:text-base mb-3 md:mb-4 dark:text-white">Método de Pagamento</h3>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-3 md:p-4 border-2 border-blue-500 rounded-lg dark:border-blue-600 dark:bg-gray-900 bg-blue-50">
                    <RadioGroupItem value="transferencia" id="transferencia" className="border-blue-500" />
                    <Label
                      htmlFor="transferencia"
                      className="flex items-center gap-2 md:gap-3 cursor-pointer flex-1 dark:text-gray-300"
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-sm md:text-base dark:text-white">Transferência Bancária</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Via WhatsApp • Confirmação rápida</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-start gap-2">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Liberação em até 2 horas após confirmação do pagamento</span>
                </p>
              </div>

              <Button
                onClick={handleFinalizarCompra}
                disabled={isProcessing}
                className="w-full bg-[#DE2535] hover:bg-[#c01f2d] text-white dark:bg-[#DE2535] dark:hover:bg-[#c01f2d] h-12 md:h-14 text-base md:text-lg font-semibold"
                size="lg"
              >
                {isProcessing ? (
                  "Processando..."
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Finalizar via WhatsApp
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
                Ao clicar, você será redirecionado para o WhatsApp da IMDN para concluir sua compra de forma segura e
                personalizada.
              </p>
            </Card>

            <Card className="p-4 md:p-6 bg-green-50 dark:bg-gray-800 border-green-200 dark:border-gray-700 hidden lg:block">
              <h3 className="font-bold text-base mb-4 text-green-900 dark:text-green-400 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Garantias e Benefícios
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-green-800 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Acesso vitalício aos cursos adquiridos</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-green-800 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Certificado de conclusão reconhecido</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-green-800 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Suporte direto via WhatsApp</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-green-800 dark:text-gray-300">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Atualizações de conteúdo gratuitas</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4 bg-blue-50 dark:bg-gray-800 border-blue-200 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm mb-1 text-blue-900 dark:text-blue-400">Compra 100% Segura</h3>
                  <p className="text-xs text-blue-700 dark:text-gray-300 leading-relaxed">
                    Seus dados estão protegidos. Atendimento personalizado e suporte dedicado durante todo o processo.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
