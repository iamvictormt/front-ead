'use client';

import type React from 'react';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Users, Edit, Eye, Plus, Loader2, X, EyeClosed } from 'lucide-react';
import { apiService, type CourseAvailable, type Course } from '@/lib/api';
import { useToast } from '@/contexts/toast-context';
import { useSidebar } from '@/contexts/sidebar-context';
import Link from 'next/link';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import clsx from 'clsx';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { formatKwanza } from '@/lib/utils';

export default function AdminCoursesPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<CourseAvailable[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isCollapsed,
    'md:ml-80': !isCollapsed,
    'pt-14 md:pt-0': true,
  });

  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    price: '',
  });
  const [saving, setSaving] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const [courseToReactivate, setCourseToReactivate] = useState<{ id: string; title: string } | null>(null);
  const [isReactivating, setIsReactivating] = useState(false);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllCourses();
      console.log(response.data);
      if (response.success && response.data) {
        setCourses(response.data || []);
      } else {
        showError(response.error || 'Erro ao carregar cursos');
      }
    } catch (error) {
      showError('Erro ao carregar cursos');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      course.title?.toLowerCase().includes(searchLower) ||
      course.instructor?.toLowerCase().includes(searchLower) ||
      course.category?.toLowerCase().includes(searchLower)
    );
  });

  const handleEditCourse = (course: CourseAvailable) => {
    window.location.href = `/admin/cursos/editar/${course.id}`;
  };

  const handleSaveSimpleEdit = async () => {
    if (!editingCourse) return;

    try {
      setSaving(true);

      // Extrair valor numérico do preço
      const priceValue = Number.parseFloat(editForm.price.replace(/[^\d,]/g, '').replace(',', '.')) || 0;

      const updateData = {
        title: editForm.title,
        description: editForm.description,
        price: priceValue,
      };

      // Usar PATCH para atualização parcial
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${editingCourse.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        success('Curso atualizado com sucesso!');
        setEditingCourse(null);
        loadCourses(); // Recarregar lista
      } else {
        throw new Error('Erro ao atualizar curso');
      }
    } catch (error) {
      showError('Erro ao atualizar curso');
    } finally {
      setSaving(false);
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKwanza(e.target.value);
    setEditForm((prev) => ({ ...prev, price: formatted }));
  };

  const handleDeleteCourse = (course: CourseAvailable) => {
    setCourseToDelete({ id: course.id.toString(), title: course.title });
    setShowDeleteDialog(true);
  };

  const handleReactivateCourse = (course: CourseAvailable) => {
    setCourseToReactivate({ id: course.id.toString(), title: course.title });
    setShowReactivateDialog(true);
  };

  const confirmDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      setIsDeleting(true);
      // TODO: Implementar desativação na API
      const response = await apiService.deactivateCourse(courseToDelete.id);
      if (response.success) {
        success('Curso desativado com sucesso!');
        setShowDeleteDialog(false);
        setCourseToDelete(null);
        loadCourses();
      } else {
        showError(response.error || 'Erro ao desativar curso');
      }
    } catch (error) {
      showError('Erro ao desativar curso');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmReactivateCourse = async () => {
    if (!courseToReactivate) return;

    try {
      setIsReactivating(true);
      // TODO: Implementar reativação na API
      const response = await apiService.reactivateCourse(courseToReactivate.id);
      if (response.success) {
        success('Curso reativado com sucesso!');
        setShowReactivateDialog(false);
        setCourseToReactivate(null);
        loadCourses();
      } else {
        showError(response.error || 'Erro ao reativar curso');
      }
    } catch (error) {
      showError('Erro ao reativar curso');
    } finally {
      setIsReactivating(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['ADMIN']}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center pt-14 md:pt-0">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary dark:text-white" />
            <span className="text-foreground dark:text-white">Carregando cursos...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CollapsibleSidebar onToggle={setIsCollapsed} />

        <div className={contentMargin}>
          {/* Header */}
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#121F3F] md:bg-white md:dark:bg-gray-800 md:rounded-xl shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 md:dark:text-white ml-12 md:ml-0">
                    Gerenciar Cursos
                  </h1>
                  <p className="text-xs text-gray-400 md:dark:text-gray-300 hidden md:block">
                    {courses.length} cursos cadastrados
                  </p>
                </div>
                <Link href="/admin/cursos/novo">
                  <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Curso
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto space-y-6">
                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 p-4 md:p-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Buscar por curso, instrutor ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Results count */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-300">
                    <span className="text-lg">
                      {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} encontrado
                      {filteredCourses.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                      <div
                        key={course.id}
                        className={clsx(
                          'bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300',
                          course.deactivatedIn
                            ? 'opacity-60 grayscale hover:shadow-md hover:opacity-100 hover:grayscale-0 dark:hover:shadow-gray-700/20'
                            : 'hover:shadow-lg dark:hover:shadow-gray-700/30 hover:-translate-y-1'
                        )}
                      >
                        {/* Course thumbnail */}
                        <div className="relative h-48 bg-gradient-to-br from-blue-500/20 to-purple-600/20 dark:from-blue-500/30 dark:to-purple-600/30">
                          <img
                            src={course.thumbnailUrl || '/placeholder.svg?height=192&width=384&query=curso'}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4 flex gap-2">
                            {course.deactivatedIn && (
                              <Badge
                                variant="secondary"
                                className="bg-red-100 text-red-800 border border-red-200 dark:border-red-800"
                              >
                                Desativado em {new Date(course.deactivatedIn).toLocaleDateString('pt-BR')}
                              </Badge>
                            )}
                            <Badge
                              variant="secondary"
                              className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white"
                            >
                              {course.category}
                            </Badge>
                          </div>
                        </div>

                        {/* Course content */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            {course.title}
                          </h3>

                          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                            {course.description}
                          </p>

                          <div className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                            Instrutor:{' '}
                            <span className="font-medium text-gray-900 dark:text-white">{course.instructor}</span>
                          </div>

                          {/* Course stats */}
                          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium text-gray-900 dark:text-white">
                                {course.rating || '4.5'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{course.studentsCount || 0} alunos</span>
                            </div>
                          </div>

                          {/* Price and action buttons */}
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {formatKwanza(course.price || 0)}
                            </div>
                            <div className="flex gap-2">
                              {!course.deactivatedIn && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 bg-transparent"
                                  onClick={() => handleEditCourse(course)}
                                  title="Editar Curso"
                                  disabled={!!course.deactivatedIn}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              )}

                              {course.deactivatedIn ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 dark:border-gray-600 bg-transparent"
                                  onClick={() => handleReactivateCourse(course)}
                                  title="Reativar curso"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:text-yellow-300 dark:hover:bg-yellow-900/20 dark:border-gray-600 bg-transparent"
                                  onClick={() => handleDeleteCourse(course)}
                                  title="Desativar curso"
                                >
                                  <EyeClosed className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <Search className="h-16 w-16 text-gray-400 dark:text-gray-500 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Nenhum curso encontrado
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Não encontramos cursos que correspondam à sua busca. Tente usar termos diferentes.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button
                          variant="outline"
                          onClick={() => setSearchTerm('')}
                          className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                        >
                          Ver todos os cursos
                        </Button>
                        <Link href="/admin/cursos/novo">
                          <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Criar Primeiro Curso
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>

        <ConfirmationDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setCourseToDelete(null);
          }}
          onConfirm={confirmDeleteCourse}
          title="Desativar Curso"
          message={`Tem certeza que deseja desativar o curso "${courseToDelete?.title}"? O curso ficará indisponível para novos alunos, mas os alunos já matriculados continuarão tendo acesso.`}
          confirmText="Desativar"
          cancelText="Cancelar"
          variant="warning"
          isLoading={isDeleting}
        />

        <ConfirmationDialog
          isOpen={showReactivateDialog}
          onClose={() => {
            setShowReactivateDialog(false);
            setCourseToReactivate(null);
          }}
          onConfirm={confirmReactivateCourse}
          title="Reativar Curso"
          message={`Tem certeza que deseja reativar o curso "${courseToReactivate?.title}"? O curso ficará disponível novamente para novos alunos se inscreverem.`}
          confirmText="Reativar"
          cancelText="Cancelar"
          variant="default"
          isLoading={isReactivating}
        />

        {editingCourse && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Editar Curso</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Edição limitada (curso já vendido)</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCourse(null)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title" className="text-gray-900 dark:text-white">
                      Título do Curso *
                    </Label>
                    <Input
                      id="edit-title"
                      value={editForm.title}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Digite o título do curso"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description" className="text-gray-900 dark:text-white">
                      Descrição *
                    </Label>
                    <Textarea
                      id="edit-description"
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white min-h-[100px]"
                      placeholder="Descreva o que o aluno aprenderá neste curso..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-price" className="text-gray-900 dark:text-white">
                      Preço *
                    </Label>
                    <Input
                      id="edit-price"
                      value={editForm.price}
                      onChange={handlePriceChange}
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="0,00 Kz"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setEditingCourse(null)}
                    className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveSimpleEdit}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={saving || !editForm.title || !editForm.description}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
