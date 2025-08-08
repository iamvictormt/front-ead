'use client';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import clsx from 'clsx';
import { useSidebar } from '@/contexts/sidebar-context';

export default function AlunoDashboard() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isCollapsed);
  const { user } = useAuth();

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isSidebarCollapsed,
    'md:ml-80': !isSidebarCollapsed,
  });

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-gray-50">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />

        <div className={contentMargin}>
          {/* Header */}
          <header className="md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#2D2D2D] md:bg-white md:rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 ml-12 md:ml-0">
                    Dashboard
                  </h1>
                </div>
                <div className="flex items-center space-x-2 md:space-x-4">
                  <div className="text-xs md:text-sm text-white md:text-gray-900 hidden sm:block">
                    Bem-vindo, {user?.name}!
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0)}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                  <div className="bg-white rounded-lg shadow p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-blue-600"
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
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Cursos Inscritos</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">3</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-green-600"
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
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Cursos Concluídos</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">1</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <svg
                          className="w-5 h-5 md:w-6 md:h-6 text-yellow-600"
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
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Horas de Estudo</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">24h</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Current Course */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <span>⭐ 4.8</span>
                        <span className="hidden sm:inline">Based on 238 reviews</span>
                      </div>
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                        Beginner's Guide to Successful Company Management: Business and User Goals
                      </h1>
                      <p className="text-gray-600 mb-4 text-sm md:text-base">
                        Continue de onde parou e complete este curso incrível sobre gestão empresarial.
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0 mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-300 rounded-full"></div>
                          <span className="text-sm font-medium">Jenny Wilson</span>
                        </div>
                        <span className="text-sm text-gray-500">Progresso: 22%</span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '22%' }}></div>
                      </div>

                      <button className="bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base">
                        Continuar Curso
                      </button>
                    </div>
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                      <div className="w-full h-32 lg:w-48 lg:h-32 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg"></div>
                    </div>
                  </div>
                </div>

                {/* My Courses Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
                  {/* Enrolled Courses */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                      <h3 className="text-base md:text-lg font-medium text-gray-900">Meus Cursos</h3>
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="space-y-3 md:space-y-4">
                        {[
                          { name: 'React Fundamentals', progress: 75, instructor: 'João Silva' },
                          { name: 'JavaScript Avançado', progress: 45, instructor: 'Maria Santos' },
                          { name: 'Node.js Backend', progress: 10, instructor: 'Pedro Costa' },
                        ].map((course, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-3 md:p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900 text-sm md:text-base truncate">{course.name}</h4>
                              <span className="text-sm text-gray-500 flex-shrink-0 ml-2">{course.progress}%</span>
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 mb-3">Instrutor: {course.instructor}</p>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${course.progress}%` }}
                              ></div>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Continuar →
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Achievements & Certificates */}
                  <div className="bg-white rounded-lg shadow">
                    <div className="px-4 md:px-6 py-4 border-b border-gray-200">
                      <h3 className="text-base md:text-lg font-medium text-gray-900">Conquistas</h3>
                    </div>
                    <div className="p-4 md:p-6">
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-yellow-50 rounded-lg">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-full flex items-center justify-center text-lg md:text-xl flex-shrink-0">
                            🏆
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm md:text-base">Primeiro Curso Concluído</p>
                            <p className="text-xs md:text-sm text-gray-600">
                              Parabéns por completar seu primeiro curso!
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-blue-50 rounded-lg">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-full flex items-center justify-center text-lg md:text-xl flex-shrink-0">
                            📚
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm md:text-base">Estudante Dedicado</p>
                            <p className="text-xs md:text-sm text-gray-600">20+ horas de estudo completadas</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 md:space-x-4 p-3 md:p-4 bg-green-50 rounded-lg">
                          <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center text-lg md:text-xl flex-shrink-0">
                            🎯
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm md:text-base">Meta Semanal</p>
                            <p className="text-xs md:text-sm text-gray-600">Completou 5 lições esta semana</p>
                          </div>
                        </div>
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
  );
}
