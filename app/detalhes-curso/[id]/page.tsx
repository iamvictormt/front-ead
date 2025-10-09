'use client';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService, type Lesson, type Module, type Course } from '@/lib/api';
import { PlayCircle, Users, Star, Loader2, ArrowLeft, ShoppingCart, Lock, BookOpen, Package } from 'lucide-react';
import { useSidebar } from '@/contexts/sidebar-context';
import clsx from 'clsx';
import { useToast } from '@/contexts/toast-context';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getVideoEmbedUrl } from '@/lib/utils';

export default function CursoPublicoPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [course, setCourse] = useState<Course>();
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'addToCart' | 'buyNow' | 'enrollFree' | null>(null);
  const { error: showError, success: showSuccess } = useToast();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;
  const { user, isLoading } = useAuth();
  const { addToCart } = useCart();

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isCollapsed,
    'md:ml-80': !isCollapsed,
    'pt-14 md:pt-0': true,
  });

  useEffect(() => {
    if (courseId) {
      loadCourseDetails(courseId);
    }
  }, [isLoading === false]);

  const loadCourseDetails = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getCourseToPurchase(courseId, user?.id || '0');
      if (response.success && response.data) {
        setCourse(response.data);
      } else {
        showError(response.error || 'Erro ao carregar detalhes do curso');
        router.push('/aluno');
      }
    } catch (error) {
      showError('Erro ao carregar detalhes do curso');
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollFree = async () => {
    if (!user) {
      setPendingAction('enrollFree');
      setShowLoginDialog(true);
      return;
    }

    if (!course) return;

    try {
      setEnrolling(true);
      const response = await apiService.purchaseCourse(course.id.toString());

      if (response.success) {
        showSuccess('Matrícula realizada com sucesso!');
        setTimeout(() => {
          router.push(`/aluno/curso/${course.id}`);
        }, 1000);
      } else {
        showError(response.error || 'Erro ao realizar matrícula');
      }
    } catch (error) {
      showError('Erro ao realizar matrícula');
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddToCart = () => {
    if (!user) {
      setPendingAction('addToCart');
      setShowLoginDialog(true);
      return;
    }

    if (course) {
      const cartItem = {
        id: course.id.toString(),
        title: course.title,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl || '/placeholder.svg',
        instructor: {
          name: course.instructor,
          avatar: '/placeholder.svg',
        },
      };
      addToCart(cartItem);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      setPendingAction('buyNow');
      setShowLoginDialog(true);
      return;
    }

    if (course) {
      const cartItem = {
        id: course.id.toString(),
        title: course.title,
        price: course.price,
        thumbnailUrl: course.thumbnailUrl || '/placeholder.svg',
        instructor: {
          name: course.instructor,
          avatar: '/placeholder.svg',
        },
      };
      addToCart(cartItem);
      router.push('/aluno/carrinho');
    }
  };

  const handleLoginRedirect = () => {
    if (!course || !pendingAction) return;

    const actionData = {
      type: pendingAction === 'enrollFree' ? 'enroll' : pendingAction === 'buyNow' ? 'checkout' : 'addToCart',
      courseId: course.id.toString(),
      returnUrl: `/curso/${course.id}`,
    };

    localStorage.setItem('pendingAction', JSON.stringify(actionData));

    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center pt-14 md:pt-0">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary dark:text-white" />
          <span className="text-foreground dark:text-white">Carregando curso...</span>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CollapsibleSidebar onToggle={setIsCollapsed} />
        <div className={`${contentMargin} flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Curso não encontrado</p>
            <Button onClick={() => router.push('/aluno/comprar-cursos')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Cursos
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const totalLessons = course.modules?.reduce((acc, module: Module) => acc + (module.lessons?.length || 0), 0) || 0;
  const totalModules = course.modules.length || 0;

  const isPaidCourse = course.price > 0;
  const maxVisibleModules = isPaidCourse && !user ? 2 : course.modules.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CollapsibleSidebar onToggle={setIsCollapsed} />

      <Dialog open={showLoginDialog} onOpenChange={setShowLoginDialog}>
        <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">Login Necessário</DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-300">
              Você precisa fazer login para{' '}
              {pendingAction === 'enrollFree' ? 'se matricular neste curso' : 'adicionar cursos ao carrinho'}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowLoginDialog(false);
                setPendingAction(null);
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleLoginRedirect}>Fazer Login</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
        <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Detalhes do Curso</h1>
              <Button variant="outline" onClick={() => router.push('/comprar-cursos')}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                <span className="hidden md:inline">Voltar aos Cursos</span>
                <span className="md:hidden">Voltar</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="px-4 md:px-6 py-4 md:py-6">
            <div className="mx-auto space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-6 border border-gray-200 dark:border-gray-700">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 flex items-center justify-center">
                    <img
                      src={course.thumbnailUrl || '/placeholder.svg?height=300&width=400&query=course'}
                      alt={course.title}
                      className="w-full h-48 md:h-64 object-cover object-center rounded-lg"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">{course.title}</h2>
                      <p className="text-gray-600 dark:text-gray-300 text-lg">{course.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-md px-3 py-2">
                        <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                          {course.rating || 0.0} avaliações
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-md px-3 py-2">
                        <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {course.studentsCount || 0} alunos
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/30 rounded-md px-3 py-2">
                        <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {totalModules} módulos
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900/30 rounded-md px-3 py-2">
                        <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {totalLessons} aulas
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Preço</p>
                          {course.price === 0 ? (
                            <p className="text-sm inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold">
                              Grátis
                            </p>
                          ) : (
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(
                                course.price
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        {course.price === 0 ? (
                          <Button onClick={handleEnrollFree} className="flex-1" size="lg" disabled={enrolling}>
                            {enrolling ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Matriculando...
                              </>
                            ) : (
                              <>
                                <PlayCircle className="w-5 h-5 mr-2" />
                                Matricular Gratuitamente
                              </>
                            )}
                          </Button>
                        ) : (
                          <>
                            <Button
                              onClick={handleBuyNow}
                              className="flex-1 bg-[#DE2535] hover:bg-[#DE2535]/90 p-2 text-white"
                              size="lg"
                            >
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              Comprar Agora
                            </Button>
                            <Button
                              onClick={handleAddToCart}
                              variant="outline"
                              className="flex-1 bg-transparent p-2"
                              size="lg"
                            >
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              Adicionar ao Carrinho
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {course?.previewVideoUrl && (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      Prévia do Curso
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
                      <iframe
                        src={getVideoEmbedUrl(course.previewVideoUrl)}
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        className="w-full h-full"
                        title={course.title}
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                    Conteúdo do Curso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {course.price > 0 ? (
                    <div className="space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white dark:via-gray-800/50 dark:to-gray-800 z-10 flex items-center justify-center">
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md mx-4 border-2 border-[#DE2535]">
                            <div className="text-center">
                              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#DE2535]/10 rounded-full mb-4">
                                <Lock className="w-8 h-8 text-[#DE2535]" />
                              </div>
                              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Conteúdo Bloqueado
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-6">
                                Adquira este curso para ter acesso completo a {totalModules} módulos com {totalLessons}{' '}
                                aulas exclusivas.
                              </p>
                              <div className="flex flex-col gap-3">
                                <Button
                                  onClick={handleBuyNow}
                                  className="w-full bg-[#DE2535] hover:bg-[#DE2535]/90 text-white"
                                  size="lg"
                                >
                                  <ShoppingCart className="w-5 h-5 mr-2" />
                                  Comprar Agora
                                </Button>
                                <Button
                                  onClick={handleAddToCart}
                                  variant="outline"
                                  className="w-full bg-transparent"
                                  size="lg"
                                >
                                  Adicionar ao Carrinho
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="blur-sm pointer-events-none select-none space-y-4 opacity-50">
                          {course.modules?.slice(0, 3).map((module: any, moduleIndex) => (
                            <div
                              key={module.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                            >
                              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3">
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  Módulo {moduleIndex + 1}: {module.title}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {module.lessons?.length || 0} aulas
                                </p>
                              </div>
                              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {module.lessons?.slice(0, 3).map((lesson: Lesson, lessonIndex: number) => (
                                  <div key={lesson.id} className="px-4 py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Lock className="w-4 h-4 text-gray-400" />
                                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        Aula {lessonIndex + 1}: {lesson.title}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                          O que você vai aprender:
                        </h4>
                        <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                          <li className="flex items-start gap-2">
                            <span>Acesso completo a {totalModules} módulos estruturados</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>{totalLessons} aulas em vídeo de alta qualidade</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>Certificado de conclusão ao finalizar o curso</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span>Acesso vitalício ao conteúdo</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {course.modules && course.modules.length > 0 ? (
                        <>
                          {course.modules.map((module: any, moduleIndex) => (
                            <div
                              key={module.id}
                              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                            >
                              <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3">
                                <h5 className="font-semibold text-gray-900 dark:text-white">
                                  Módulo {moduleIndex + 1}: {module.title}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {module.lessons?.length || 0} aulas
                                </p>
                              </div>
                              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                {module.lessons?.map((lesson: Lesson, lessonIndex: number) => (
                                  <div
                                    key={lesson.id}
                                    className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-3 flex-1">
                                      <PlayCircle className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 dark:text-white break-words sm:truncate">
                                          Aula {lessonIndex + 1}: {lesson.title}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}

                          {!user && (
                            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                              <div className="flex items-start gap-3">
                                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                                    Faça login para acessar o conteúdo completo
                                  </h4>
                                  <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                                    Matricule-se neste curso gratuito para ter acesso a todas as aulas e certificado.
                                  </p>
                                  <Button size="sm" onClick={() => router.push('/login')}>
                                    Fazer Login
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Nenhum módulo disponível.</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
