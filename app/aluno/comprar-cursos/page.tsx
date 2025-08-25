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

export default function ComprarCursosPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState<CourseAvailable[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error: showError } = useToast();
  const { addToCart, isInCart } = useCart();

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isSidebarCollapsed,
    'md:ml-80': !isSidebarCollapsed,
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

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

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
        <div className="min-h-screen bg-background flex items-center justify-center pt-14 md:pt-0">
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
        <CartSidebar />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#2D2D2D] md:bg-white md:rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 ml-12 md:ml-0">
                  Comprar cursos
                </h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto space-y-6">
                {/* Results count */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
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
                          className="bg-card rounded-xl shadow-sm border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                        >
                          {/* Course thumbnail */}
                          <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20">
                            <img
                              src={course.thumbnailUrl || '/placeholder.svg'}
                              alt={course.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-4 right-4">
                              <Badge variant="secondary" className="bg-white/90 text-foreground">
                                {course.category}
                              </Badge>
                            </div>
                          </div>

                          {/* Course content */}
                          <div className="p-6">
                            <h3 className="text-xl font-bold text-card-foreground mb-2 line-clamp-2">{course.title}</h3>

                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{course.description}</p>

                            <div className="text-sm text-muted-foreground mb-4">
                              Instrutor: <span className="font-medium text-card-foreground">{course.instructor}</span>
                            </div>

                            {/* Course stats */}
                            <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                <span className="font-medium text-card-foreground">{course.rating}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{course.studentsCount} alunos</span>
                              </div>
                            </div>

                            {/* Price and buy button */}
                            <div className="flex items-center justify-between">
                              <div className="text-2xl font-bold text-primary">{formatPrice(course.price)}</div>
                              <Button
                                className={clsx(
                                  'transition-all duration-200',
                                  inCart
                                    ? 'bg-green-600 hover:bg-green-700 text-white'
                                    : 'bg-accent hover:bg-accent/90 text-accent-foreground'
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
                      <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold text-card-foreground mb-2">Nenhum curso encontrado</h3>
                      <p className="text-muted-foreground mb-6">
                        Não encontramos cursos que correspondam à sua busca. Tente usar termos diferentes.
                      </p>
                      <Button variant="outline" onClick={() => setSearchTerm('')}>
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
