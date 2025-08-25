'use client';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { apiService, type MyCourse } from '@/lib/api';
import { Search, Play, BookOpen, Clock, Award, Users, Star, Loader2 } from 'lucide-react';
import { useSidebar } from '@/contexts/sidebar-context';
import clsx from 'clsx';
import { useToast } from '@/contexts/toast-context';
import { useRouter } from 'next/navigation';

export default function MeusCursosPage() {
  const { isCollapsed } = useSidebar();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isCollapsed);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [meusCursos, setMeusCursos] = useState<MyCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const { error: showError } = useToast();
  const router = useRouter();

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isSidebarCollapsed,
    'md:ml-80': !isSidebarCollapsed,
    'pt-14 md:pt-0': true, // Add top padding for mobile header
  });

  useEffect(() => {
    loadMyCourses();
  }, []);

  const loadMyCourses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMyCourses();
      if (response.success && response.data) {
        setMeusCursos(response.data.courses || []);
      } else {
        showError(response.error || 'Erro ao carregar cursos');
      }
    } catch (error) {
      showError('Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const openCourse = (courseId: string) => {
    router.push(`/aluno/curso/${courseId}`);
  };

  const filteredCursos = meusCursos.filter((curso) => {
    const matchesSearch =
      curso.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      curso.description.toLowerCase().includes(searchTerm.toLowerCase());

    const progressPercentage = curso.progress
      ? (curso.progress.completedLessons / curso.progress.totalLessons) * 100
      : 0;

    const status = progressPercentage === 100 ? 'Concluído' : progressPercentage > 0 ? 'Em Progresso' : 'Não Iniciado';

    const matchesFilter =
      filterStatus === 'todos' ||
      (filterStatus === 'em-progresso' && status === 'Em Progresso') ||
      (filterStatus === 'concluidos' && status === 'Concluído') ||
      (filterStatus === 'nao-iniciados' && status === 'Não Iniciado');

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluído':
        return 'bg-green-100 text-green-800';
      case 'Em Progresso':
        return 'bg-blue-100 text-blue-800';
      case 'Não Iniciado':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Carregando cursos...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-gray-50">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#2D2D2D] md:bg-white md:rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 ml-12 md:ml-0">
                  Meus Cursos
                </h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
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
                          {
                            meusCursos.filter(
                              (c) => c.progress && c.progress.completedLessons / c.progress.totalLessons === 1
                            ).length
                          }
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
                          {
                            meusCursos.filter(
                              (c) =>
                                c.progress &&
                                c.progress.completedLessons > 0 &&
                                c.progress.completedLessons / c.progress.totalLessons < 1
                            ).length
                          }
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
                        <p className="text-xs md:text-sm font-medium text-gray-600">Certificados</p>
                        <p className="text-xl md:text-2xl font-semibold text-gray-900">
                          {meusCursos.filter((c) => c.certificate).length}
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
                        variant={filterStatus === 'todos' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('todos')}
                      >
                        Todos
                      </Button>
                      <Button
                        variant={filterStatus === 'em-progresso' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('em-progresso')}
                      >
                        Em Progresso
                      </Button>
                      <Button
                        variant={filterStatus === 'concluidos' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setFilterStatus('concluidos')}
                      >
                        Concluídos
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Course Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredCursos.map((curso) => {
                    const progressPercentage = curso.progress
                      ? (curso.progress.completedLessons / curso.progress.totalLessons) * 100
                      : 0;
                    const status =
                      progressPercentage === 100
                        ? 'Concluído'
                        : progressPercentage > 0
                        ? 'Em Progresso'
                        : 'Não Iniciado';

                    return (
                      <Card
                        key={curso.id}
                        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => openCourse(curso.id.toString())}
                      >
                        <div className="relative">
                          <img
                            src={curso.thumbnailUrl || '/placeholder.svg?height=200&width=300'}
                            alt={curso.title}
                            className="w-full h-48 object-cover"
                          />
                          <Badge className={`absolute top-2 right-2 ${getStatusColor(status)}`}>{status}</Badge>
                        </div>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-semibold text-lg line-clamp-2">{curso.title}</h3>
                              <p className="text-sm text-gray-600">por {curso.instructor || 'Instrutor'}</p>
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500" />
                                <span>{curso.rating || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{curso.studentsCount || 0}</span>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progresso</span>
                                <span className="font-medium">{Math.round(progressPercentage)}%</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                              <p className="text-xs text-gray-500">
                                {curso.progress?.completedLessons || 0} de {curso.progress?.totalLessons || 0} aulas
                              </p>
                            </div>

                            <div className="flex gap-2 pt-2">
                              {status === 'Concluído' ? (
                                <>
                                  <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                                    <BookOpen className="w-4 h-4 mr-1" />
                                    Revisar
                                  </Button>
                                  {curso.certificate && (
                                    <Button size="sm" variant="outline">
                                      <Award className="w-4 h-4" />
                                    </Button>
                                  )}
                                </>
                              ) : (
                                <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                  <Play className="w-4 h-4 mr-1" />
                                  {status === 'Não Iniciado' ? 'Iniciar' : 'Continuar'}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
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
  );
}
