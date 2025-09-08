"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useSidebar } from "@/contexts/sidebar-context"
import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import clsx from "clsx"
import Link from "next/link"
import { apiService } from "@/lib/api"
import { formatKwanza } from "@/lib/utils"
import { Users, BookOpen, BarChart3, ShoppingBag, Plus, UserCheck, TrendingUp, ChevronRight } from "lucide-react"

interface DashboardData {
  recentUsers: Array<{
    name: string
    email: string
    profilePic: string | null
    createdAt: string
  }>
  totalStudents: number
  activeCourses: number
  monthlyRevenue: number
  totalPurchases: number
  topCourses: Array<{
    courseId: number
    _count: { courseId: number }
    title: string
  }>
}

export default function AdminDashboard() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const response = await apiService.getAdminStats()
        setDashboardData(response.data)
      } catch (error) {
        console.error("Erro ao carregar dados da dashboard:", error)
      }
    }

    loadDashboardData()
  }, [apiService])

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return "Hoje"
    if (diffInDays === 1) return "Ontem"
    return `Há ${diffInDays} dias`
  }

  const contentMargin = clsx("transition-all duration-300 ease-in-out flex flex-col min-h-screen", {
    "md:ml-42": isCollapsed,
    "md:ml-80": !isCollapsed,
    "pt-14 md:pt-0": true,
  })

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CollapsibleSidebar onToggle={setIsCollapsed} />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-white dark:bg-gray-800 md:rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white ml-12 md:ml-0">
                    Olá, {user?.name?.split(" ")[0]}! 👨‍💼
                  </h1>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                  <div className="text-xs md:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                    {new Date().toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                          Total de Alunos
                        </p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                          {dashboardData?.totalStudents || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">Cursos Ativos</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                          {dashboardData?.activeCourses || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                          Receita Mensal
                        </p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                          {dashboardData ? formatKwanza(dashboardData.monthlyRevenue) : "Kz 0,00"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                        <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">
                          Total de Vendas
                        </p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                          {dashboardData?.totalPurchases || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 overflow-hidden">
                    <div className="bg-[#121F3F] dark:bg-gray-900 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white">Alunos Recentes</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {dashboardData?.recentUsers?.map((user, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <Avatar className="w-10 h-10 flex-shrink-0">
                              <AvatarImage src={user.profilePic || undefined} alt={user.name} />
                              <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-medium">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                              {formatRelativeDate(user.createdAt)}
                            </div>
                          </div>
                        )) || (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">Nenhum usuário recente encontrado</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 overflow-hidden">
                    <div className="bg-[#121F3F] dark:bg-gray-900 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white">Top Cursos</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {dashboardData?.topCourses?.map((course, index) => (
                          <div
                            key={course.courseId}
                            className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {course.title}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {course._count.courseId} {course._count.courseId === 1 ? "aluno" : "alunos"}
                              </p>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">#{index + 1}</div>
                          </div>
                        )) || (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">Nenhum curso encontrado</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 overflow-hidden">
                    <div className="bg-[#121F3F] dark:bg-gray-900 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white">Links Rápidos</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-3">
                        <Link
                          href="/admin/cursos/novo"
                          className="block w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                  <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    Criar Novo Curso
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Adicionar um novo curso à plataforma
                                  </p>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                          </div>
                        </Link>

                        <Link
                          href="/admin/alunos"
                          className="block w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                  <UserCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    Gerenciar Alunos
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Administrar alunos cadastrados na plataforma
                                  </p>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                          </div>
                        </Link>

                        <button className="block w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 group text-left">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                  <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    Relatórios
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                    Visualizar relatórios e analytics
                                  </p>
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
