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
import { Search, Gift, Users, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { apiService } from '@/lib/api';
import { useToast } from '@/contexts/toast-context';

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

export default function ManageStudentsPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const [usersData, setUsersData] = useState<UsersResponse>({
    users: [],
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState(''); // Input temporário antes de pesquisar
  const [isSearching, setIsSearching] = useState(false);

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
  }, [currentPage]);

  useEffect(() => {
    if (selectedUser) loadCourses();
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers(currentPage, 20, searchInput || '');
      setUsersData(response.data);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setError('Erro ao carregar alunos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset para primeira página ao pesquisar
    setIsSearching(true);
    loadUsers();
    setIsSearching(false);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const loadCourses = async () => {
    if (selectedUser === null) return;
    try {
      const response = await apiService.getAvailableCoursesByUser(selectedUser?.id);
      setCourses(response.data);
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
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < usersData.totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const hasActiveFilters = searchTerm;

  if (loading && !usersData.users.length) {
    return (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-14 md:pt-0">
          <div className="flex items-center gap-2">
            <LoadingSpinner className="w-6 h-6 text-primary dark:text-white" />
            <span className="text-foreground dark:text-white">Carregando alunos...</span>
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
                  {/* Pesquisa */}
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                      <Input
                        placeholder="Pesquisar por nome ou email..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch();
                          }
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

                <div className="mb-8">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-300">
                    <span className="text-lg">
                      {usersData.users.length} aluno{usersData.users.length !== 1 ? 's' : ''} encontrado
                      {usersData.users.length !== 1 ? 's' : ''}
                    </span>
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
                                            {courses.length === 0 && (
                                              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block pl-2 pt-2">
                                                Nenhum curso disponível para esse usuário
                                              </label>
                                            )}
                                            {courses.map((course) => (
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
        </div>
      </div>
    </ProtectedRoute>
  );
}
