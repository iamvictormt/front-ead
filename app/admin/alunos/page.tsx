'use client';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { useSidebar } from '@/contexts/sidebar-context';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/loading-spinner';
import { ErrorMessage } from '@/components/error-message';
import clsx from 'clsx';
import { Search, Gift, Users, ChevronLeft, ChevronRight, X, Download } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToast } from '@/contexts/toast-context';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';
import { Footer } from '@/components/footer';

interface User {
  id: number;
  name: string;
  email: string;
  profilePic: string | null;
  role: string;
  createdAt: string;
}

interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

interface Course {
  id: number;
  title: string;
  price: number;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function ManageStudentsPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const [usersData, setUsersData] = useState<UsersResponse>({
    users: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [allCourses, setAllCourses] = useState<Course[]>([]); // cursos para o filtro
  const [enrollCourses, setEnrollCourses] = useState<Course[]>([]); // cursos para vincular
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const [searchInput, setSearchInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [pageSize, setPageSize] = useState(20);

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const { success, error: showError } = useToast();

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isCollapsed,
    'md:ml-80': !isCollapsed,
    'pt-14 md:pt-0': true,
  });

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize]);

  useEffect(() => {
    if (selectedUser) loadEnrollCourses();
  }, [selectedUser]);

  useEffect(() => {
    loadAllCourses();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const courseId = selectedCourseFilter !== 'all' ? Number(selectedCourseFilter) : undefined;
      const response = await apiService.getAllUsers(currentPage, pageSize, searchTerm, courseId);
      setUsersData(response.data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setError('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const loadAllCourses = async () => {
    try {
      const response = await apiService.getAllCourses(); // endpoint que lista todos os cursos
      setAllCourses(response.data);
    } catch (error) {
      console.error('Erro ao carregar cursos para filtro:', error);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1);
    setIsSearching(true);
    // Chama loadUsers com os valores atualizados via useEffect após state updates
    setTimeout(() => {
      loadUsersWithParams(searchInput, selectedCourseFilter);
      setIsSearching(false);
    }, 0);
  };

  // Versão de loadUsers que aceita parâmetros diretos (evita stale closure)
  const loadUsersWithParams = async (search: string, courseFilter: string) => {
    try {
      setLoading(true);
      const courseId = courseFilter !== 'all' ? Number(courseFilter) : undefined;
      const response = await apiService.getAllUsers(1, pageSize, search, courseId);
      setUsersData(response.data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setError('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleCourseFilterChange = (value: string) => {
    setSelectedCourseFilter(value);
    setCurrentPage(1);
    setTimeout(() => {
      loadUsersWithParams(searchInput, value);
    }, 0);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setSelectedCourseFilter('all');
    setCurrentPage(1);
    setTimeout(() => {
      loadUsersWithParams('', 'all');
    }, 0);
  };

  const handlePageSizeChange = (value: string) => {
    setPageSize(Number(value));
    setCurrentPage(1);
  };

  const loadEnrollCourses = async () => {
    if (selectedUser === null) return;
    try {
      const response = await apiService.getAvailableCoursesByUser(selectedUser?.id);
      setEnrollCourses(response.data);
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    }
  };

  const handleEnrollUser = async () => {
    if (!selectedUser || !selectedCourse) return;

    try {
      setIsEnrolling(true);
      const response = await apiService.enrollCourseStudent(selectedUser.id, Number.parseInt(selectedCourse));
      if (response.success) {
        setShowEnrollDialog(false);
        setSelectedUser(null);
        setSelectedCourse('');
        loadUsers();
        success('Curso vinculado ao aluno com sucesso!');
      } else {
        showError(response.error || 'Erro ao vincular usuário ao curso');
      }
    } catch (error) {
      console.error('Erro ao vincular usuário ao curso:', error);
    } finally {
      setIsEnrolling(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge variant="destructive">Admin</Badge>;
      case 'STUDENT':
        return <Badge variant="secondary">Aluno</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < usersData.totalPages) setCurrentPage(currentPage + 1);
  };

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      // Busca TODOS os resultados da consulta atual (sem paginação)
      const studentsToExport: User[] = usersData.users;

      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setTextColor(33, 33, 33);
      doc.text('Lista de Alunos', 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      const reportDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR });
      doc.text(`Gerado em: ${reportDate}`, 14, 30);

      // Mostra filtros aplicados no PDF
      const activeFilters: string[] = [];
      if (searchTerm) activeFilters.push(`Pesquisa: "${searchTerm}"`);
      if (selectedCourseFilter !== 'all') {
        const course = allCourses.find((c) => c.id.toString() === selectedCourseFilter);
        if (course) activeFilters.push(`Curso: ${course.title}`);
      }
      if (activeFilters.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(120);
        doc.text(`Filtros: ${activeFilters.join(' | ')}`, 14, 37);
      }

      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Total de alunos: ${studentsToExport.length}`, 14, activeFilters.length > 0 ? 44 : 37);

      const tableRows = studentsToExport.map((student) => [
        student.name,
        student.email,
        format(new Date(student.createdAt), 'dd/MM/yyyy', { locale: ptBR }),
      ]);

      autoTable(doc, {
        head: [['Nome', 'Email', 'Cadastrado em']],
        body: tableRows,
        startY: activeFilters.length > 0 ? 50 : 44,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [249, 250, 251] },
      });

      doc.save(`lista_alunos_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
      success(`PDF gerado com ${studentsToExport.length} alunos!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      showError('Erro ao gerar PDF.');
    } finally {
      setDownloading(false);
    }
  };

  const hasActiveFilters = searchTerm || selectedCourseFilter !== 'all';

  if (loading && !usersData.users.length) {
    return (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div className="fixed inset-0 z-[9999] bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin"></div>
            <span className="text-gray-900 dark:text-gray-100 font-medium">Carregando...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CollapsibleSidebar onToggle={setIsCollapsed} />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#121F3F] md:bg-white md:dark:bg-gray-800 md:rounded-xl shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 md:dark:text-white ml-12 md:ml-0">
                    Gerenciar Alunos
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge
                    variant="outline"
                    className="text-sm bg-white/10 md:bg-transparent border-white/20 md:border-gray-200 text-white md:text-gray-900 md:dark:text-white"
                  >
                    {usersData.total} alunos
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-sm bg-white/10 md:bg-gray-100 md:dark:bg-gray-700 text-white md:text-gray-900 md:dark:text-white"
                  >
                    Página {usersData.page} de {usersData.totalPages}
                  </Badge>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto space-y-6">
                {error && (
                  <div className="mb-6">
                    <ErrorMessage message={error} />
                  </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-4 md:p-6 space-y-4">
                  {/* Linha 1: Pesquisa + Botão pesquisar */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                      <Input
                        placeholder="Pesquisar por nome ou email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSearch();
                        }}
                        className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      disabled={isSearching}
                      className="bg-[#DE2535] hover:bg-[#DE2535]/90 text-white"
                    >
                      {isSearching ? (
                        <>
                          <LoadingSpinner className="w-4 h-4 mr-2" />
                          Pesquisando...
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4 mr-2" />
                          Pesquisar
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Linha 2: Filtro por curso + Resultados por página + Download */}
                  <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
                    {/* Filtro por curso */}
                    <div className="flex items-center gap-2 flex-1">
                      <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Filtrar por curso:
                      </label>
                      <Select value={selectedCourseFilter} onValueChange={handleCourseFilterChange}>
                        <SelectTrigger className="w-full md:w-84 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Todos os cursos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os cursos</SelectItem>
                          {allCourses.map((course) => (
                            <SelectItem key={course.id} value={course.id.toString()}>
                              {course.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Resultados por página */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        Resultados por página:
                      </label>
                      <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-30 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="99999999">Todos</SelectItem>

                          {PAGE_SIZE_OPTIONS.map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botão PDF */}
                    <Button
                      variant="outline"
                      onClick={handleDownloadPDF}
                      disabled={downloading}
                      className="flex items-center space-x-1 bg-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                    >
                      {downloading ? (
                        <>
                          <LoadingSpinner className="w-4 h-4 mr-2" />
                          Gerando PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Baixar como PDF
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Botão Limpar Filtros */}
                  {hasActiveFilters && (
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearFilters}
                        className="text-gray-600 dark:text-gray-300 bg-transparent"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Limpar Filtros
                      </Button>
                    </div>
                  )}
                </div>

                {/* Contador de resultados */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-300">
                    <span className="text-lg">
                      {usersData.total} aluno{usersData.total !== 1 ? 's' : ''} encontrado
                      {usersData.total !== 1 ? 's' : ''}
                    </span>
                    {usersData.total !== usersData.users.length && (
                      <span className="text-sm text-gray-400 dark:text-gray-500">
                        (exibindo {usersData.users.length} nesta página)
                      </span>
                    )}
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="text-xs">
                        Filtros ativos
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Lista de alunos */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 overflow-hidden border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Alunos Cadastrados</h2>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Mostrando {usersData.users.length} de {usersData.total} alunos
                      </span>
                    </div>
                  </div>

                  {loading ? (
                    <div className="p-8 flex justify-center">
                      <LoadingSpinner className="w-6 h-6 text-primary" />
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {usersData.users.map((user) => (
                        <div key={user.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={user.profilePic || undefined} alt={user.name} />
                                <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                                  {user.name
                                    .split(' ')
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user.name}
                                  </h3>
                                  {getRoleBadge(user.role)}
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                                  <span>Cadastrado em {formatDate(user.createdAt)}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              {user.role === 'STUDENT' && (
                                <Dialog
                                  open={showEnrollDialog && selectedUser?.id === user.id}
                                  onOpenChange={(open) => {
                                    setShowEnrollDialog(open);
                                    if (!open) {
                                      setSelectedUser(null);
                                      setSelectedCourse('');
                                    }
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setSelectedUser(user)}
                                      className="flex items-center space-x-1"
                                    >
                                      <Gift className="w-4 h-4" />
                                      <span className="hidden md:inline">Vincular Curso</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Vincular Curso</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                          Usuário selecionado:
                                        </p>
                                        <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                                          <Avatar className="w-8 h-8">
                                            <AvatarImage src={user.profilePic || undefined} alt={user.name} />
                                            <AvatarFallback className="text-xs">
                                              {user.name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <p className="text-sm font-medium">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                          </div>
                                        </div>
                                      </div>

                                      <div>
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                          Selecionar Curso:
                                        </label>
                                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Escolha um curso..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {enrollCourses.length === 0 && (
                                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block pl-2 pt-2">
                                                Nenhum curso disponível para esse usuário
                                              </label>
                                            )}
                                            {enrollCourses.map((course) => (
                                              <SelectItem key={course.id} value={course.id.toString()}>
                                                <div className="flex items-center justify-between w-full">
                                                  <span>{course.title}</span>
                                                  <span className="text-xs text-gray-500 ml-2">
                                                    {new Intl.NumberFormat('pt-AO', {
                                                      style: 'currency',
                                                      currency: 'AOA',
                                                    }).format(course.price)}
                                                  </span>
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      <div className="flex justify-end space-x-2 pt-4">
                                        <Button
                                          variant="outline"
                                          onClick={() => setShowEnrollDialog(false)}
                                          disabled={isEnrolling}
                                        >
                                          Cancelar
                                        </Button>
                                        <Button onClick={handleEnrollUser} disabled={!selectedCourse || isEnrolling}>
                                          {isEnrolling ? (
                                            <>
                                              <LoadingSpinner className="w-4 h-4 mr-2" />
                                              Vinculando...
                                            </>
                                          ) : (
                                            <>
                                              <Gift className="w-4 h-4 mr-2" />
                                              Vincular Curso
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {usersData.users.length === 0 && !loading && (
                    <div className="p-8 text-center">
                      <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Nenhum usuário encontrado
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        {hasActiveFilters
                          ? 'Não encontramos alunos que correspondam aos filtros aplicados.'
                          : 'Nenhum usuário cadastrado no sistema.'}
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="outline"
                          onClick={handleClearFilters}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 bg-transparent"
                        >
                          Limpar Filtros
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {usersData.totalPages > 1 && (
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Página {usersData.page} de {usersData.totalPages} • {usersData.total} alunos no total
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          disabled={currentPage === 1 || loading}
                          className="flex items-center space-x-1 bg-transparent"
                        >
                          <ChevronLeft className="w-4 h-4" />
                          <span>Anterior</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                          disabled={currentPage === usersData.totalPages || loading}
                          className="flex items-center space-x-1 bg-transparent"
                        >
                          <span>Próxima</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
