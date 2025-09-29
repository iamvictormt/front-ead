'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { useSidebar } from '@/contexts/sidebar-context';
import { Button } from '@/components/ui/button';
import { Users, Star, ArrowRight, Quote, UserPlus, BookOpen, GraduationCap, Award, Eye } from 'lucide-react';
import clsx from 'clsx';
import { apiService, type CourseAvailable } from '@/lib/api';
import Link from 'next/link';
import { formatKwanza } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const router = useRouter();
  const [featuredCourses, setFeaturedCourses] = useState<CourseAvailable[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isCollapsed,
    'md:ml-80': !isCollapsed,
    'pt-14 md:pt-0': true,
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'STUDENT') {
        router.push('/aluno');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  const testimonials = [
    {
      id: 1,
      name: 'Ana Rodrigues',
      course: 'Marketing Digital Avançado',
      rating: 5,
      comment:
        'Os cursos do IMDN transformaram minha carreira. Consegui aplicar os conhecimentos imediatamente no meu trabalho e já vi resultados incríveis!',
      avatar: '/placeholder.svg?height=80&width=80',
    },
    {
      id: 2,
      name: 'Carlos Mendes',
      course: 'Desenvolvimento Web Completo',
      rating: 5,
      comment:
        'Excelente plataforma! Os professores são muito qualificados e o conteúdo é atualizado. Recomendo para quem quer se destacar no mercado.',
      avatar: '/placeholder.svg?height=80&width=80',
    },
    {
      id: 3,
      name: 'Beatriz Santos',
      course: 'Design Gráfico Profissional',
      rating: 5,
      comment:
        'Aprendi muito mais do que esperava. A metodologia é clara e os projetos práticos me ajudaram a construir um portfólio profissional.',
      avatar: '/placeholder.svg?height=80&width=80',
    },
  ];

  useEffect(() => {
    const loadFeaturedCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await apiService.getActiveCourses();
        if (response.success && response.data && response.data.courses.length > 0) {
          setFeaturedCourses(response.data.courses.slice(0, 3));
        }
      } catch (error) {
        setFeaturedCourses([]);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadFeaturedCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin"></div>
          <span className="text-gray-900 dark:text-gray-100">Carregando...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <CollapsibleSidebar onToggle={setIsCollapsed} />

      <div className={contentMargin}>
        <header className="md:px-6 top-0 md:top-4 relative mb-6 md:mb-8">
          <div className="bg-[#121F3F] md:dark:bg-gray-800 md:rounded-lg shadow dark:shadow-gray-700/20 p-4 md:p-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="h-30 w-30 mx-auto flex items-center justify-center mb-4">
                <Image
                  src="/brasao-vermelho.png"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-full w-auto"
                  priority
                />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
                Instituto de <br /> Marketing Digital e Negócio
              </h1>
              <p className="text-lg text-gray-300 mb-6">
                O IMDN é uma plataforma de ensino a distância que oferece cursos de qualidade com certificação
                reconhecida. Aprenda no seu ritmo, com professores especializados e conteúdo atualizado.
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="px-4 md:px-6 py-4 md:py-6">
            <div className="mx-auto space-y-8">
              {/* Cursos em Destaque */}
              <section>
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Cursos em Destaque
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">Explore nossa seleção de cursos mais populares</p>
                </div>

                {loadingCourses ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 border-4 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-gray-100 rounded-full animate-spin"></div>
                      <span className="text-gray-600 dark:text-gray-300">Carregando cursos...</span>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredCourses.map((course) => (
                      <div
                        key={course.id}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-700/30 transition-all duration-300 hover:-translate-y-1"
                      >
                        <div className="relative h-48 bg-gray-100 dark:bg-gray-700">
                          <img
                            src={course.thumbnailUrl || '/placeholder.svg'}
                            alt={course.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge
                              variant="secondary"
                              className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white"
                            >
                              {course.category}
                            </Badge>
                          </div>
                        </div>

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

                          <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="font-medium text-gray-900 dark:text-white">{course.rating}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{course.studentsCount} alunos</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
                            <div className="text-2xl font-bold text-[#121F3F] dark:text-blue-400">
                              {course.price === 0 ? (
                                <span className="text-sm inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold">
                                  Grátis
                                </span>
                              ) : (
                                formatKwanza(course.price)
                              )}
                            </div>

                            <Link href={`/detalhes-curso/${course.id}`} className="flex-1 sm:flex-none">
                              <Button className="w-full transition-all duration-200 bg-[#DE2535] hover:bg-[#c41e2a] text-white">
                                <Eye className="h-4 w-4 mr-1" />
                                Ver Mais
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-center mt-8">
                  <Button
                    size="lg"
                    className="bg-[#121F3F] hover:bg-[#0d1629] dark:bg-gray-700 dark:hover:bg-gray-700 text-white p-4"
                    onClick={() => router.push('/cursos-disponiveis')}
                  >
                    Ver Cursos Disponíveis
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </section>

              {/* Como Funciona */}
              <section className="mt-12">
                <div className="mb-8 text-left">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Como Funciona</h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Comece sua jornada de aprendizado em apenas 4 passos simples
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="relative">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border border-gray-200 dark:border-gray-700 p-6 h-full">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                          <UserPlus className="h-8 w-8 text-[#121F3F] dark:text-blue-400" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#121F3F] dark:bg-gray-700 text-white flex items-center justify-center text-sm font-bold mb-3">
                          1
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Crie sua Conta</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Cadastre-se gratuitamente em menos de 1 minuto
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border border-gray-200 dark:border-gray-700 p-6 h-full">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                          <BookOpen className="h-8 w-8 text-[#121F3F] dark:text-blue-400" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#121F3F] dark:bg-gray-700 text-white flex items-center justify-center text-sm font-bold mb-3">
                          2
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Escolha seu Curso</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Navegue pelo catálogo e escolha os cursos ideais
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border border-gray-200 dark:border-gray-700 p-6 h-full">
                      <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                          <GraduationCap className="h-8 w-8 text-[#121F3F] dark:text-blue-400" />
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#121F3F] dark:bg-gray-700 text-white flex items-center justify-center text-sm font-bold mb-3">
                          3
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Estude no seu Ritmo</h3>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                          Assista às aulas quando e onde quiser
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border-2 border-[#DE2535] dark:border-red-700 p-6 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                        <Award className="h-8 w-8 text-[#DE2535] dark:text-red-400" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#DE2535] dark:bg-red-700 text-white flex items-center justify-center text-sm font-bold mb-3">
                        4
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Obtenha seu Certificado</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Receba certificado reconhecido ao concluir
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* O Que Nossos Alunos Dizem */}
              <section className="mt-12">
                <div className="mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    O Que Nossos Alunos Dizem
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Veja os depoimentos de quem já transformou sua carreira com o IMDN
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {testimonials.map((testimonial) => (
                    <div
                      key={testimonial.id}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border border-gray-200 dark:border-gray-700 p-6"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={testimonial.avatar || '/placeholder.svg'}
                          alt={testimonial.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300">{testimonial.course}</p>
                        </div>
                        <Quote className="h-8 w-8 text-gray-300 dark:text-gray-600" />
                      </div>

                      <div className="flex items-center gap-1 mb-3">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-current" />
                        ))}
                      </div>

                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{testimonial.comment}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* CTA Final */}
              <section className="mt-12">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border border-gray-200 dark:border-gray-700 p-8 md:p-12">
                  <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                      Pronto para Começar sua Jornada?
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                      Junte-se a milhares de alunos que já estão transformando suas carreiras com nossos cursos.
                      Cadastre-se agora e comece a aprender gratuitamente!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        className="bg-[#DE2535] hover:bg-[#c41e2a] text-white p-4"
                        onClick={() => router.push('/register')}
                      >
                        Criar Conta Gratuita
                      </Button>

                      <Button
                        size="lg"
                        className="bg-[#121F3F] hover:bg-[#0d1629] dark:bg-gray-700 dark:hover:bg-gray-700 text-white p-4"
                        onClick={() => router.push('/cursos-disponiveis')}
                      >
                        Explorar Cursos
                      </Button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
