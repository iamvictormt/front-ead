"use client"

import type React from "react"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Save, GripVertical } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSidebar } from "@/contexts/sidebar-context"
import clsx from "clsx"
import { useToast } from "@/contexts/toast-context"
//import { apiService, CourseDTO } from '@/lib/api';

interface Lesson {
  id: string
  title: string
  videoUrl: string
  pdfUrl: string
  order: number
}

interface Module {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

interface CourseData {
  title: string
  description: string
  price: number
  thumbnailUrl: string
  instructor: string
  category: string
  rating: number
  studentsCount: number
  modules: Module[]
}

export default function NovoCursoPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { success, error: showError } = useToast()

  const contentMargin = clsx("transition-all duration-300 ease-in-out flex flex-col min-h-screen", {
    "md:ml-42": isCollapsed,
    "md:ml-80": !isCollapsed,
    "pt-14 md:pt-0": true,
  })

  const [courseData, setCourseData] = useState<CourseData>({
    title: "",
    description: "",
    price: 0,
    thumbnailUrl: "",
    instructor: "",
    category: "",
    rating: 0,
    studentsCount: 0,
    modules: [],
  })

  const formatPrice = (value: string) => {
    // Remove tudo que não é número
    const numericValue = value.replace(/[^\d]/g, "")

    if (!numericValue) return "Kz "

    // Converte para número e divide por 100 para ter centavos
    const number = Number.parseInt(numericValue) / 100

    // Formata como moeda angolana
    return new Intl.NumberFormat("pt-AO", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 2,
    }).format(number)
  }

  const formatRating = (value: string) => {
    // Remove caracteres inválidos, mantém apenas números e ponto
    let cleaned = value.replace(/[^\d.]/g, "")

    // Garante apenas um ponto decimal
    const parts = cleaned.split(".")
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("")
    }

    // Limita a uma casa decimal
    if (parts[1] && parts[1].length > 1) {
      cleaned = parts[0] + "." + parts[1].substring(0, 1)
    }

    // Converte para número para validar limites
    const numValue = Number.parseFloat(cleaned)

    // Se exceder 5, limita a 5
    if (numValue > 5) {
      return "5.0"
    }

    return cleaned
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value)
    e.target.value = formatted

    // Extrai o valor numérico para salvar no state
    const numericValue =
      formatted === "Kz " ? 0 : Number.parseFloat(formatted.replace(/[^\d,]/g, "").replace(",", ".")) || 0
    setCourseData((prev) => ({ ...prev, price: numericValue }))
  }

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRating(e.target.value)
    e.target.value = formatted

    const numericValue = Number.parseFloat(formatted) || 0
    setCourseData((prev) => ({ ...prev, rating: numericValue }))
  }

  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: "",
      order: courseData.modules.length + 1,
      lessons: [],
    }
    setCourseData((prev) => ({
      ...prev,
      modules: [...prev.modules, newModule],
    }))
  }

  const removeModule = (moduleId: string) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.filter((m) => m.id !== moduleId),
    }))
  }

  const updateModule = (moduleId: string, field: keyof Module, value: any) => {
    setCourseData((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, [field]: value } : m)),
    }))
  }

  const addLesson = (moduleId: string) => {
    const module = courseData.modules.find((m) => m.id === moduleId)
    if (!module) return

    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: "",
      videoUrl: "",
      pdfUrl: "",
      order: module.lessons.length + 1,
    }

    updateModule(moduleId, "lessons", [...module.lessons, newLesson])
  }

  const removeLesson = (moduleId: string, lessonId: string) => {
    const module = courseData.modules.find((m) => m.id === moduleId)
    if (!module) return

    updateModule(
      moduleId,
      "lessons",
      module.lessons.filter((l) => l.id !== lessonId),
    )
  }

  const updateLesson = (moduleId: string, lessonId: string, field: keyof Lesson, value: any) => {
    const module = courseData.modules.find((m) => m.id === moduleId)
    if (!module) return

    const updatedLessons = module.lessons.map((l) => (l.id === lessonId ? { ...l, [field]: value } : l))
    updateModule(moduleId, "lessons", updatedLessons)
  }

  const validateCourse = (): string[] => {
    const errors: string[] = []

    // Validar campos obrigatórios básicos
    if (!courseData.title.trim()) errors.push("Título do curso é obrigatório")
    if (!courseData.description.trim()) errors.push("Descrição é obrigatória")
    if (!courseData.instructor.trim()) errors.push("Instrutor é obrigatório")
    if (!courseData.category) errors.push("Categoria é obrigatória")
    if (courseData.price <= 0) errors.push("Preço deve ser maior que zero")

    // Validar módulos
    if (courseData.modules.length === 0) {
      errors.push("O curso deve ter pelo menos um módulo")
    } else {
      // Validar cada módulo
      courseData.modules.forEach((module, moduleIndex) => {
        if (!module.title.trim()) {
          errors.push(`Título do módulo ${moduleIndex + 1} é obrigatório`)
        }

        if (module.lessons.length === 0) {
          errors.push(`Módulo ${moduleIndex + 1} deve ter pelo menos uma aula`)
        } else {
          // Validar cada aula
          module.lessons.forEach((lesson, lessonIndex) => {
            if (!lesson.title.trim()) {
              errors.push(`Título da aula ${lessonIndex + 1} do módulo ${moduleIndex + 1} é obrigatório`)
            }
            if (!lesson.videoUrl.trim()) {
              errors.push(`URL do vídeo da aula ${lessonIndex + 1} do módulo ${moduleIndex + 1} é obrigatória`)
            }
          })
        }
      })
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateCourse()

    if (validationErrors.length > 0) {
      showError(`Corrija os seguintes erros:\n• ${validationErrors.join("\n• ")}`)
      return
    }

    setIsLoading(true)

    /*try {
      const apiData: CourseDTO = {
        title: courseData.title,
        description: courseData.description,
        price: courseData.price,
        thumbnailUrl: courseData.thumbnailUrl,
        instructor: courseData.instructor,
        category: courseData.category,
        rating: courseData.rating,
        studentsCount: courseData.studentsCount,
        modules: courseData.modules.map((module) => ({
          title: module.title,
          order: module.order,
          lessons: module.lessons.map((lesson) => ({
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            pdfUrl: lesson.pdfUrl || null,
            order: lesson.order,
          })),
        })),
      };

      //const response = await apiService.addCourse(apiData);

      if (response.success && response.data) {
        success('Curso salvo com sucesso');
      } else {
        const messages = Array.isArray(response.error)
          ? response.error.join(', ')
          : response.error || 'Erro ao salvar curso';

        showError(messages);
      }
    } catch (error) {
      showError('Erro ao salvar curso');
    } finally {
      setIsLoading(false);
    }*/
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CollapsibleSidebar onToggle={setIsCollapsed} />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-white dark:bg-gray-800 md:rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      Cadastrar Novo Curso
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                      Crie um novo curso para sua plataforma
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? "Salvando..." : "Salvar Curso"}
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações Básicas */}
                  <Card className="bg-[#121F3F] dark:bg-gray-900 pb-0 border-0 rounded-xl shadow-sm dark:shadow-gray-700 overflow-hidden">
                    <CardHeader className="text-white">
                      <CardTitle className="text-lg">Informações Básicas</CardTitle>
                      <CardDescription className="text-gray-300">Dados principais do curso</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 bg-white dark:bg-gray-800 space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm font-medium text-gray-900 dark:text-white">
                            Título do Curso *
                          </Label>
                          <Input
                            id="title"
                            value={courseData.title}
                            onChange={(e) => setCourseData((prev) => ({ ...prev, title: e.target.value }))}
                            placeholder="Ex: Introdução ao React"
                            required
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="instructor" className="text-sm font-medium text-gray-900 dark:text-white">
                            Instrutor *
                          </Label>
                          <Input
                            id="instructor"
                            value={courseData.instructor}
                            onChange={(e) => setCourseData((prev) => ({ ...prev, instructor: e.target.value }))}
                            placeholder="Nome do instrutor"
                            required
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium text-gray-900 dark:text-white">
                          Descrição *
                        </Label>
                        <Textarea
                          id="description"
                          value={courseData.description}
                          onChange={(e) => setCourseData((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Descreva o que o aluno aprenderá neste curso..."
                          rows={4}
                          required
                          className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="price" className="text-sm font-medium text-gray-900 dark:text-white">
                            Preço (AOA) *
                          </Label>
                          <Input
                            id="price"
                            type="text"
                            onChange={handlePriceChange}
                            placeholder="Kz 0,00"
                            defaultValue="Kz "
                            required
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="category" className="text-sm font-medium text-gray-900 dark:text-white">
                            Categoria *
                          </Label>
                          <Select
                            value={courseData.category}
                            onValueChange={(value) => setCourseData((prev) => ({ ...prev, category: value }))}
                            required
                          >
                            <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500">
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                              <SelectItem value="Desenvolvimento Web">Desenvolvimento Web</SelectItem>
                              <SelectItem value="Mobile">Mobile</SelectItem>
                              <SelectItem value="Data Science">Data Science</SelectItem>
                              <SelectItem value="Design">Design</SelectItem>
                              <SelectItem value="Marketing">Marketing</SelectItem>
                              <SelectItem value="Negócios">Negócios</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="rating" className="text-sm font-medium text-gray-900 dark:text-white">
                            Avaliação Inicial (0-5)
                          </Label>
                          <Input
                            id="rating"
                            type="text"
                            onChange={handleRatingChange}
                            placeholder="4.5"
                            className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="thumbnailUrl" className="text-sm font-medium text-gray-900 dark:text-white">
                          URL da Imagem de Capa
                        </Label>
                        <Input
                          id="thumbnailUrl"
                          value={courseData.thumbnailUrl}
                          onChange={(e) => setCourseData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                          placeholder="https://exemplo.com/imagem.jpg"
                          className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Módulos e Aulas */}
                  <Card className="bg-[#121F3F] dark:bg-gray-900 pb-0 border-0 rounded-xl shadow-sm dark:shadow-gray-700 overflow-hidden">
                    <CardHeader className="text-white">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="text-lg">Módulos e Aulas</CardTitle>
                          <CardDescription className="text-gray-300">
                            Organize o conteúdo do curso em módulos e aulas
                          </CardDescription>
                        </div>
                        <Button
                          type="button"
                          onClick={addModule}
                          variant="outline"
                          size="sm"
                          className="border-white/30 text-white hover:bg-white/20 bg-white/10 font-medium shadow-sm hover:text-white"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Módulo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 bg-white dark:bg-gray-800">
                      {courseData.modules.length > 0 ? (
                        <div className="space-y-6">
                          {courseData.modules.map((module, moduleIndex) => (
                            <div
                              key={module.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-gray-50 dark:bg-gray-700/50"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <GripVertical className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                  <Badge
                                    variant="secondary"
                                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1"
                                  >
                                    Módulo {moduleIndex + 1}
                                  </Badge>
                                </div>
                                <Button
                                  type="button"
                                  onClick={() => removeModule(module.id)}
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>

                              <div className="space-y-4">
                                <Input
                                  value={module.title}
                                  onChange={(e) => updateModule(module.id, "title", e.target.value)}
                                  placeholder="Título do módulo *"
                                  required
                                  className="bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />

                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-sm font-medium text-gray-900 dark:text-white">
                                      Aulas do Módulo
                                    </Label>
                                    <Button
                                      type="button"
                                      onClick={() => addLesson(module.id)}
                                      variant="outline"
                                      size="sm"
                                      className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-blue-50/50 dark:bg-blue-900/10 font-medium"
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Adicionar Aula
                                    </Button>
                                  </div>

                                  {module.lessons.map((lesson, lessonIndex) => (
                                    <div
                                      key={lesson.id}
                                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800"
                                    >
                                      <div className="flex items-center justify-between mb-3">
                                        <Badge
                                          variant="outline"
                                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                                        >
                                          Aula {lessonIndex + 1}
                                        </Badge>
                                        <Button
                                          type="button"
                                          onClick={() => removeLesson(module.id, lesson.id)}
                                          variant="ghost"
                                          size="sm"
                                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>

                                      <div className="space-y-3">
                                        <Input
                                          value={lesson.title}
                                          onChange={(e) => updateLesson(module.id, lesson.id, "title", e.target.value)}
                                          placeholder="Título da aula *"
                                          required
                                          className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Input
                                          value={lesson.videoUrl}
                                          onChange={(e) =>
                                            updateLesson(module.id, lesson.id, "videoUrl", e.target.value)
                                          }
                                          placeholder="URL do vídeo (YouTube, Vimeo, etc.) *"
                                          required
                                          className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                        <Input
                                          value={lesson.pdfUrl}
                                          onChange={(e) => updateLesson(module.id, lesson.id, "pdfUrl", e.target.value)}
                                          placeholder="URL do PDF (opcional)"
                                          className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                    </div>
                                  ))}

                                  {module.lessons.length === 0 && (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/30 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                                      <p className="font-medium">Nenhuma aula adicionada</p>
                                      <p className="text-sm mt-1">Clique em "Adicionar Aula" para começar</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                          <div className="max-w-sm mx-auto">
                            <h3 className="text-lg font-medium mb-2">Nenhum módulo criado</h3>
                            <p className="text-sm mb-4">
                              Organize seu curso em módulos para uma melhor experiência de aprendizado
                            </p>
                            <Button
                              type="button"
                              onClick={addModule}
                              variant="outline"
                              className="border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 bg-blue-50/50 dark:bg-blue-900/10 font-medium shadow-sm"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Criar Primeiro Módulo
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </form>
              </div>
            </div>
          </main>

          <div className="md:hidden fixed top-2 right-4 z-40">
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              <Save className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
