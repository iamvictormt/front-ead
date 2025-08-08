"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Users, Clock, Star } from 'lucide-react'
import { usePaginatedApi } from "@/hooks/use-api"
import { apiService } from "@/lib/api"

export default function AdminCursosPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const { user } = useAuth()

  const contentMargin = `md:${isSidebarCollapsed ? "ml-22" : "ml-72"}`

  // Usar API real para buscar cursos
  const {
    data: cursos,
    loading,
    error,
    updateParams,
    pagination
  } = usePaginatedApi(
    (params) => apiService.getCourses(params),
    { page: 1, limit: 12 }
  )

  // Atualizar parâmetros quando filtros mudarem
  useEffect(() => {
    const params: any = {}
    
    if (searchTerm) params.search = searchTerm
    if (statusFilter !== "todos") params.status = statusFilter
    
    updateParams(params)
  }, [searchTerm, statusFilter])

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm) {
        updateParams({ search: searchTerm })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  if (loading && cursos.length === 0) {
    return (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            <span>Carregando cursos...</span>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Erro ao carregar cursos: {error}</p>
            <Button onClick={() => window.location.reload()}>
              Tentar Novamente
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />
        
        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-4 md:px-6 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <h1 className="text-xl md:text-2xl font-semibold text-gray-900 ml-12 md:ml-0">Gerenciar Cursos</h1>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Curso
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="max-w-7xl mx-auto">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar cursos, instrutores ou categorias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setStatusFilter("todos")}>Todos</Button>
                      <Button variant="outline" size="sm" onClick={() => setStatusFilter("ativo")}>Ativos</Button>
                      <Button variant="outline" size="sm" onClick={() => setStatusFilter("rascunho")}>Rascunhos</Button>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Total de Cursos</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">{cursos?.length || 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Cursos Ativos</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">
                          {cursos?.filter(c => c.status === 'ativo').length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Users className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Total de Alunos</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">
                          {cursos?.reduce((acc, curso) => acc + (curso.alunos || 0), 0) || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Star className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Avaliação Média</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">4.8</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cursos?.map((curso) => (
                    <div key={curso.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                      {/* Course Image Placeholder */}
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                      
                      {/* Course Content */}
                      <div className="p-4 md:p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Badge variant={curso.status === 'ativo' ? 'default' : 'secondary'}>
                            {curso.status}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-600">{curso.rating}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{curso.titulo}</h3>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{curso.descricao}</p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="w-4 h-4 mr-2" />
                            {curso.alunos} alunos
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            {curso.duracao}
                          </div>
                          <div className="text-sm text-gray-500">
                            Instrutor: {curso.instrutor}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-semibold text-gray-900">{curso.preco}</span>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {cursos?.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                      <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum curso encontrado</p>
                      <p className="text-sm">Tente ajustar os filtros de busca</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
