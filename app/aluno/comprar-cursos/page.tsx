"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Star, Clock, Users, Filter, Heart } from 'lucide-react'

export default function ComprarCursosPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("todos")
  const [priceFilter, setPriceFilter] = useState("todos")
  const { user } = useAuth()

  const contentMargin = `md:${isSidebarCollapsed ? "ml-22" : "ml-72"}`

  // Mock data para cursos disponíveis
  const cursosDisponiveis = [
    {
      id: 1,
      titulo: "Vue.js Completo",
      descricao: "Aprenda Vue.js do básico ao avançado com projetos práticos",
      instrutor: "Carlos Mendes",
      preco: 299.90,
      precoOriginal: 399.90,
      rating: 4.9,
      totalAvaliacoes: 1234,
      alunos: 5678,
      duracao: "14h 30min",
      categoria: "Frontend",
      nivel: "Intermediário",
      promocao: true,
      bestseller: true,
      thumbnail: "/placeholder.svg?height=200&width=300&text=Vue.js"
    },
    {
      id: 2,
      titulo: "Python Machine Learning",
      descricao: "Domine Machine Learning com Python e bibliotecas como scikit-learn",
      instrutor: "Dra. Ana Silva",
      preco: 449.90,
      precoOriginal: null,
      rating: 4.8,
      totalAvaliacoes: 892,
      alunos: 3421,
      duracao: "18h 45min",
      categoria: "Data Science",
      nivel: "Avançado",
      promocao: false,
      bestseller: false,
      thumbnail: "/placeholder.svg?height=200&width=300&text=Python+ML"
    },
    {
      id: 3,
      titulo: "Design System com Figma",
      descricao: "Crie design systems profissionais e consistentes",
      instrutor: "Marina Costa",
      preco: 199.90,
      precoOriginal: 299.90,
      rating: 4.7,
      totalAvaliacoes: 567,
      alunos: 2134,
      duracao: "8h 15min",
      categoria: "Design",
      nivel: "Iniciante",
      promocao: true,
      bestseller: false,
      thumbnail: "/placeholder.svg?height=200&width=300&text=Figma"
    },
    {
      id: 4,
      titulo: "DevOps com Docker e Kubernetes",
      descricao: "Containerização e orquestração de aplicações",
      instrutor: "Roberto Santos",
      preco: 399.90,
      precoOriginal: null,
      rating: 4.9,
      totalAvaliacoes: 743,
      alunos: 1876,
      duracao: "16h 20min",
      categoria: "DevOps",
      nivel: "Avançado",
      promocao: false,
      bestseller: true,
      thumbnail: "/placeholder.svg?height=200&width=300&text=DevOps"
    },
    {
      id: 5,
      titulo: "React Native Mobile",
      descricao: "Desenvolva apps mobile multiplataforma com React Native",
      instrutor: "Felipe Oliveira",
      preco: 349.90,
      precoOriginal: 449.90,
      rating: 4.6,
      totalAvaliacoes: 456,
      alunos: 1543,
      duracao: "12h 50min",
      categoria: "Mobile",
      nivel: "Intermediário",
      promocao: true,
      bestseller: false,
      thumbnail: "/placeholder.svg?height=200&width=300&text=React+Native"
    },
    {
      id: 6,
      titulo: "Cybersecurity Fundamentals",
      descricao: "Fundamentos de segurança cibernética e ethical hacking",
      instrutor: "Lucas Ferreira",
      preco: 499.90,
      precoOriginal: null,
      rating: 4.8,
      totalAvaliacoes: 321,
      alunos: 987,
      duracao: "20h 10min",
      categoria: "Segurança",
      nivel: "Intermediário",
      promocao: false,
      bestseller: false,
      thumbnail: "/placeholder.svg?height=200&width=300&text=Cybersecurity"
    }
  ]

  const categorias = ["todos", "Frontend", "Backend", "Mobile", "Data Science", "Design", "DevOps", "Segurança"]

  const filteredCursos = cursosDisponiveis.filter(curso => {
    const matchesSearch = curso.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.instrutor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         curso.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === "todos" || curso.categoria === selectedCategory
    
    const matchesPrice = priceFilter === "todos" ||
                        (priceFilter === "gratis" && curso.preco === 0) ||
                        (priceFilter === "ate-200" && curso.preco <= 200) ||
                        (priceFilter === "200-400" && curso.preco > 200 && curso.preco <= 400) ||
                        (priceFilter === "acima-400" && curso.preco > 400)
    
    return matchesSearch && matchesCategory && matchesPrice
  })

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-gray-50">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />
        
        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-4 md:px-6 py-4">
              <div className="flex items-center space-x-4">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 ml-12 md:ml-0">Comprar Cursos</h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="max-w-7xl mx-auto">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar cursos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Categoria</label>
                        <div className="flex flex-wrap gap-2">
                          {categorias.map((categoria) => (
                            <Button
                              key={categoria}
                              variant={selectedCategory === categoria ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedCategory(categoria)}
                              className="capitalize"
                            >
                              {categoria}
                            </Button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="sm:w-48">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Preço</label>
                        <div className="space-y-2">
                          <Button
                            variant={priceFilter === "todos" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPriceFilter("todos")}
                            className="w-full justify-start"
                          >
                            Todos os preços
                          </Button>
                          <Button
                            variant={priceFilter === "ate-200" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPriceFilter("ate-200")}
                            className="w-full justify-start"
                          >
                            Até R$ 200
                          </Button>
                          <Button
                            variant={priceFilter === "200-400" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPriceFilter("200-400")}
                            className="w-full justify-start"
                          >
                            R$ 200 - R$ 400
                          </Button>
                          <Button
                            variant={priceFilter === "acima-400" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPriceFilter("acima-400")}
                            className="w-full justify-start"
                          >
                            Acima de R$ 400
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                  <p className="text-gray-600">
                    {filteredCursos.length} curso{filteredCursos.length !== 1 ? 's' : ''} encontrado{filteredCursos.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Courses Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCursos.map((curso) => (
                    <div key={curso.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                      {/* Course Image */}
                      <div className="relative">
                        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                        <div className="absolute top-3 left-3 flex gap-2">
                          {curso.bestseller && (
                            <Badge className="bg-orange-500 text-white">Bestseller</Badge>
                          )}
                          {curso.promocao && (
                            <Badge className="bg-red-500 text-white">Promoção</Badge>
                          )}
                        </div>
                        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:bg-gray-50">
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      
                      {/* Course Content */}
                      <div className="p-4">
                        <div className="mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{curso.titulo}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{curso.descricao}</p>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-3">
                          Por {curso.instrutor}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                            <span className="font-medium text-gray-900">{curso.rating}</span>
                            <span className="ml-1">({curso.totalAvaliacoes})</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {curso.alunos.toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {curso.duracao}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl font-bold text-gray-900">
                              R$ {curso.preco.toFixed(2).replace('.', ',')}
                            </span>
                            {curso.precoOriginal && (
                              <span className="text-sm text-gray-500 line-through">
                                R$ {curso.precoOriginal.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {curso.nivel}
                          </Badge>
                        </div>
                        
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Comprar Agora
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredCursos.length === 0 && (
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
