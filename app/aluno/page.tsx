"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import clsx from "clsx"
import { useSidebar } from "@/contexts/sidebar-context"
import { apiService, type Course, type DashboardStats, type RecentActivity } from "@/lib/api"
import { useToast } from "@/contexts/toast-context"
import Link from "next/link"

export default function StudentDashboard() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const { user } = useAuth()

  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const { error: showError } = useToast()

  const contentMargin = clsx("transition-all duration-300 ease-in-out flex flex-col min-h-screen", {
    "md:ml-42": isCollapsed,
    "md:ml-80": !isCollapsed,
    "pt-14 md:pt-0": true,
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiService.getStudentStats()

      if (!response.data) return

      if (response.success) {
        setStats(response.data.stats)
        setCourses(response.data.courses)
        setRecentActivity(response.data.recentActivity || [])
      } else {
        showError("Erro ao carregar dados do dashboard")
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error)
      showError("Erro ao carregar dados do dashboard")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin"></div>
            <span className="text-gray-900 dark:text-gray-100">Carregando dashboard...</span>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const activeCourses = courses.filter((course) => course.status === "Em Progresso")
  const recentCourse = activeCourses[0] || courses[0]

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CollapsibleSidebar onToggle={setIsCollapsed} />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-white dark:bg-gray-800 md:rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white ml-12 md:ml-0">
                    Olá, {user?.name?.split(" ")[0]}! 👋
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

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto">
                {/* Progress Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                  {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Album className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">Cursos Ativos</p>
                        <p className="text-3xl font-bold">{stats?.completedCourses || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                        <BadgeCheck className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">Cursos Concluídos</p>
                        <p className="text-3xl font-bold">{stats?.activeCourses || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                        <ShieldCheck className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-300">Certificados</p>
                        <p className="text-3xl font-bold">{stats?.certificates || 0}</p>
                      </div>
                    </div>
                  </div> */}
                </div>

                {recentCourse && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/20 overflow-hidden mb-8">
                    <div className="bg-[#121F3F] dark:bg-gray-900 px-6 py-4">
                      <h2 className="text-lg font-semibold text-white">Continue Aprendendo</h2>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                              {recentCourse.category}
                            </span>
                            <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                              <span>⭐</span>
                              <span>{recentCourse.rating}</span>
                              <span className="hidden sm:inline">({recentCourse.studentsCount} alunos)</span>
                            </div>
                          </div>

                          <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                            {recentCourse.title}
                          </h3>

                          <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm md:text-base line-clamp-2">
                            {recentCourse.description}
                          </p>

                          <div className="flex items-center space-x-4 mb-4">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-200">
                                {recentCourse.instructor.charAt(0)}
                              </div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {recentCourse.instructor}
                              </span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Progresso do Curso
                              </span>
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {recentCourse.progress.percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-400 dark:to-blue-500 h-3 rounded-full transition-all duration-300"
                                style={{ width: `${recentCourse.progress.percentage}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {recentCourse.progress.completedLessons} de {recentCourse.progress.totalLessons} aulas
                              concluídas
                            </p>
                          </div>

                          <Link
                            href={`/aluno/curso/${recentCourse.id}`}
                            className="inline-flex items-center px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                          >
                            Continuar Estudando
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>

                        <div className="mt-6 lg:mt-0 lg:ml-8 flex-shrink-0">
                          <img
                            src={
                              recentCourse.thumbnailUrl ||
                              "/placeholder.svg?height=200&width=300&query=course thumbnail" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={recentCourse.title}
                            className="w-full h-48 lg:w-90 lg:h-48 object-cover rounded-lg shadow-md dark:shadow-gray-700/20"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/20 overflow-hidden">
                    <div className="bg-[#121F3F] dark:bg-gray-900 px-6 py-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Meus Cursos</h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {courses.slice(0, 3).map((course) => (
                          <div
                            key={course.id}
                            className="group border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-md dark:hover:shadow-gray-700/20 transition-all"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                                  {course.title}
                                </h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">por {course.instructor}</p>
                              </div>
                              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 ml-2">
                                {course.progress.percentage}%
                              </span>
                            </div>

                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                              <div
                                className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${course.progress.percentage}%` }}
                              ></div>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {course.progress.completedLessons}/{course.progress.totalLessons} aulas
                              </span>
                              <Link
                                href={`/aluno/curso/${course.id}`}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
                              >
                                Continuar →
                              </Link>
                            </div>
                          </div>
                        ))}

                        {courses.length === 0 && (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg
                                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhum curso encontrado</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                              Comece sua jornada de aprendizado!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-700/20 overflow-hidden">
                    <div className="bg-[#121F3F] dark:bg-gray-900 px-6 py-4">
                      <h3 className="text-lg font-semibold text-white">Atividade Recente</h3>
                    </div>
                    <div className="p-6">
                      <div className="space-y-4">
                        {recentActivity.slice(0, 4).map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0">
                              {activity.type === "lesson_completed" && (
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-5 h-5 text-green-600 dark:text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                </div>
                              )}
                              {activity.type === "certificate_earned" && (
                                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {activity.type === "lesson_completed" ? "Aula Concluída" : "Certificado Obtido"}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                {activity.lessonTitle || "Certificado do curso"}
                              </p>
                              {activity.timestamp && (
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                  {new Date(activity.timestamp).toLocaleDateString("pt-BR")}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}

                        {recentActivity.length === 0 && (
                          <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                              <svg
                                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">Nenhuma atividade recente</p>
                            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                              Suas atividades aparecerão aqui
                            </p>
                          </div>
                        )}
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
