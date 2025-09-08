'use client';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/cart-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Star, Users, ShoppingCart, Loader2, Check } from 'lucide-react';
import clsx from 'clsx';
import { apiService, type CourseAvailable } from '@/lib/api';
import { useToast } from '@/contexts/toast-context';
import { CartSidebar } from '@/components/cart-sidebar';
import { useSidebar } from '@/contexts/sidebar-context';
import { formatKwanza } from '@/lib/utils';

export default function ComprarCursosPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<CourseAvailable[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();
  const { addToCart, isInCart, items, openCart } = useCart();

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isCollapsed,
    'md:ml-80': !isCollapsed,
    'pt-14 md:pt-0': true, // Add top padding for mobile header
  });

  useEffect(() => {
    loadCoursesAvailable();

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const loadCoursesAvailable = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAvailableCourses();
      if (response.success && response.data) {
        setCourses(response.data.courses);
      } else {
        showError(response.error || 'Erro ao carregar detalhes do curso');
      }
    } catch (error) {
      showError('Erro ao carregar detalhes do curso');
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const searchLower = searchTerm.toLowerCase();
    return course.title.toLowerCase().includes(searchLower) || course.instructor.toLowerCase().includes(searchLower);
  });

  const handleAddToCart = (course: CourseAvailable) => {
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
    success('Curso adicionado ao carrinho!');
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <div className="min-h-screen bg-background dark:bg-gray-900 flex items-center justify-center pt-14 md:pt-0">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-primary dark:text-white" />
            <span className="text-foreground dark:text-white">Carregando cursos...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CollapsibleSidebar onToggle={setIsCollapsed} />
        <CartSidebar />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#121F3F] md:bg-white md:dark:bg-gray-800 md:rounded-lg shadow dark:shadow-gray-700/20 p-4 md:p-6">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 md:dark:text-white ml-12 md:ml-0">
                    Comprar Cursos
                  </h1>
                  <p className="text-xs text-gray-400 md:dark:text-gray-300 hidden md:block">
                    {courses.length} cursos disponíveis
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto space-y-6">
                {/* Search and Filters */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6 mb-6">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Buscar por curso ou instrutor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground dark:text-gray-400" />
                    </div>
                    <div className="flex gap-2 hidden md:inline">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={openCart}
                        className="relative bg-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 py-4"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {items.length > 0 && (
                          <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500 text-white">
                            {items.length}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Results count */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-gray-300">
                    <span className="text-lg">
                      {filteredCourses.length} curso{filteredCourses.length !== 1 ? 's' : ''} disponív
                      {filteredCourses.length !== 1 ? 'eis' : 'el'}
                    </span>
                  </div>
                </div>

                {filteredCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => {
                      const inCart = isInCart(course.id.toString());

                      return (
                        <div
                          key={course.id}
                          className="bg-card dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border border-border dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-700/30 transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Course thumbnail */}
                          <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 dark:from-primary/30 dark:to-accent/30">
                            <img
                              src={course.thumbnailUrl || '/placeholder.svg'}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4">
                              <Badge
                                variant="secondary"
                                className="bg-white/90 dark:bg-gray-800/90 text-foreground dark:text-white"
                              >
                                {course.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Course content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-card-foreground dark:text-white mb-2 line-clamp-2">
                              {course.title}
                            </h3>

                            <p className="text-muted-foreground dark:text-gray-300 text-sm mb-4 line-clamp-2">
                              {course.description}
                            </p>

                            <div className="text-sm text-muted-foreground dark:text-gray-300 mb-4">
                              Instrutor:{' '}
                              <span className="font-medium text-card-foreground dark:text-white">
                                {course.instructor}
                              </span>
                            </div>

                            {/* Course stats */}
                            <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground dark:text-gray-300">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-medium text-card-foreground dark:text-white">
                                  {course.rating}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{course.studentsCount} alunos</span>
                              </div>
                            </div>

                            {/* Price and buy button */}
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-primary dark:text-blue-400">
                                {formatKwanza(course.price)}
                              </div>
                              <Button
                                className={clsx(
                                  'transition-all duration-200',
                                  inCart
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-accent hover:bg-accent/90 text-accent-foreground dark:bg-red-600 dark:hover:bg-red-700 dark:text-white'
                                )}
                                onClick={() => handleAddToCart(course)}
                                disabled={inCart}
                              >
                                {inCart ? (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    No Carrinho
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Comprar
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                      <Search className="h-16 w-16 text-muted-foreground dark:text-gray-400 mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-card-foreground dark:text-white mb-2">
                        Nenhum curso encontrado
                      </h3>
                      <p className="text-muted-foreground dark:text-gray-300 mb-6">
                        Não encontramos cursos que correspondam à sua busca. Tente usar termos diferentes.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSearchTerm('')}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600"
                      >
                        Ver todos os cursos
                      </Button>
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
