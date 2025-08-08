"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Play, BookOpen, Clock, Award, Filter } from 'lucide-react'

export default function MeusCursosPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")
  const { user } = useAuth()

  const contentMargin = `md:${isSidebarCollapsed ? "ml-22" : "ml-72"}`

  // Mock data para cursos do aluno
  const meusCursos = [
    {
      id: 1,
      titulo: "React Fundamentals",
      instrutor: "João Silva",
      progresso: 75,
      duracaoTotal: "8h 30min",
      duracaoAssistida: "6h 22min",
      ultimaAula: "Hooks Avançados",
      status: "Em Progresso",
      categoria: "Frontend",
      certificado: false,
      dataInicio: "2024-01-15",
      proximaAula: "Context API"
    },
    {
      id: 2,
      titulo: "JavaScript Avançado",
      instrutor: "Maria Santos",
      progresso: 100,
      duracaoTotal: "6h 45min",
      duracaoAssistida: "6h 45min",
      ultimaAula: "Async/Await Patterns",
      status: "Concluído",
      categoria: "Frontend",
      certificado: true,
      dataInicio: "2023-12-01",
      dataConclusao: "2024-01-10"
    },
    {
      id: 3,
      titulo: "Node.js Backend Development",
      instrutor: "Pedro Costa",
      progresso: 25,
      duracaoTotal: "12h 15min",
      duracaoAssistida: "3h 04min",
      ultimaAula: "Express.js Básico",
      status: "Em Progresso",
      categoria: "Backend",
      certificado: false,
      dataInicio: "2024-02-01",
      proximaAula: "Middleware e Rotas"
    },
    {
      id: 4,
      titulo: "Python para Data Science",
      instrutor: "Ana Oliveira",
      progresso: 0,
      duracaoTotal: "15h 20min",
      duracaoAssistida: "0h 00min",
      ultimaAula: null,
      status: "Não Iniciado",
      categoria: "Data Science",
      certificado: false,
      dataInicio: "2024-02-15",
      proximaAula: "Introdução ao Python"
    }
  ]

  const filteredCursos = meusCursos.filter(curso => {
    const matchesSearch = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.instrutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === "todos" || 
                         (filterStatus === "em-progresso" && curso.status === "Em Progresso") ||
                         (filterStatus === "concluidos" && curso.status === "Concluído") ||
                         (filterStatus === "nao-iniciados" && curso.status === "Não Iniciado")
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído": return "bg-green-100 text-green-800"
      case "Em Progresso": return "bg-blue-100 text-blue-800"
      case "Não Iniciado": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-gray-50">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />
        
        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-4 md:px-6 py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 ml-12 md:ml-0">Meus Cursos</h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="max-w-7xl mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Total de Cursos</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">{meusCursos.length}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Award className="w-5 h-5 md:w-6 md:h-6 text-green-600" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Concluídos</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">
                          {meusCursos.filter(c => c.status === 'Concluído').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Play className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Em Progresso</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">
                          {meusCursos.filter(c => c.status === 'Em Progresso').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Clock className="w-5 h-5 md:w-6 md:h-6 text-purple-600" />
                      </div>
                      <div className="ml-3 md:ml-4">
                        <p className="text-xs md:text-sm font-medium text-gray-600">Horas Estudadas</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">
                          {meusCursos.reduce((acc, curso) => {
                            const horas = parseFloat(curso.duracaoAssistida.split('h')[0])
                            return acc + horas
                          }, 0).toFixed(0)}h
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar meus cursos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant={filterStatus === "todos" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setFilterStatus("todos")}
                      >
                        Todos
                      </Button>
                      <Button 
                        variant={filterStatus === "em-progresso" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setFilterStatus("em-progresso")}
                      >
                        Em Progresso
                      </Button>
                      <Button 
                        variant={filterStatus === "concluidos" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setFilterStatus("concluidos")}
                      >
                        Concluídos
                      </Button>
                      <Button 
                        variant={filterStatus === "nao-iniciados" ? "default" : "outline"} 
                        size="sm"
                        onClick={() => setFilterStatus("nao-iniciados")}
                      >
                        Não Iniciados
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Courses List */}
                <div className="space-y-4">
                  {filteredCursos.map((curso) => (
                    <div key={curso.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{curso.titulo}</h3>
                              <p className="text-sm text-gray-600">Instrutor: {curso.instrutor}</p>
                            </div>
                            <Badge className={getStatusColor(curso.status)}>
                              {curso.status}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div className="text-sm">
                              <span className="text-gray-500">Progresso:</span>
                              <div className="flex items-center space-x-2 mt-1">
                                <Progress value={curso.progresso} className="flex-1" />
                                <span className="text-sm font-medium">{curso.progresso}%</span>
                              </div>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Duração:</span>
                              <p className="font-medium">{curso.duracaoAssistida} / {curso.duracaoTotal}</p>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Categoria:</span>
                              <p className="font-medium">{curso.categoria}</p>
                            </div>
                          </div>

                          {curso.ultimaAula && (
                            <div className="text-sm mb-3">
                              <span className="text-gray-500">Última aula:</span>
                              <span className="font-medium ml-1">{curso.ultimaAula}</span>
                            </div>
                          )}

                          {curso.proximaAula && (
                            <div className="text-sm mb-3">
                              <span className="text-gray-500">Próxima aula:</span>
                              <span className="font-medium ml-1">{curso.proximaAula}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-2 lg:flex-col lg:w-48">
                          {curso.status === "Não Iniciado" ? (
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Play className="w-4 h-4 mr-2" />
                              Iniciar Curso
                            </Button>
                          ) : curso.status === "Concluído" ? (
                            <div className="space-y-2">
                              <Button variant="outline" className="w-full">
                                <BookOpen className="w-4 h-4 mr-2" />
                                Revisar
                              </Button>
                              {curso.certificado && (
                                <Button variant="outline" className="w-full">
                                  <Award className="w-4 h-4 mr-2" />
                                  Certificado
                                </Button>
                              )}
                            </div>
                          ) : (
                            <Button className="bg-blue-600 hover:bg-blue-700">
                              <Play className="w-4 h-4 mr-2" />
                              Continuar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredCursos.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-gray-500 mb-4">
                      <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
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
