'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { useSidebar } from '@/contexts/sidebar-context';
import { Button } from '@/components/ui/button';
import { Users, Star, ArrowRight, Quote, UserPlus, BookOpen, GraduationCap, Award } from 'lucide-react';
import clsx from 'clsx';
import { apiService, type CourseAvailable } from '@/lib/api';
import Link from 'next/link';
import { formatKwanza, getVideoEmbedUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function HomePage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const router = useRouter();
  const [featuredCourses, setFeaturedCourses] = useState<CourseAvailable[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [currentFormation, setCurrentFormation] = useState(0);
  const [faces, setFaces] = useState<string[]>([]);

  const formations = [
    'Marketing Digital',
    'Inteligência Artificial',
    'Branding e Posicionamento',
    'Negócios Online e Empreendedorismo',
  ];

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isCollapsed,
    'md:ml-80': !isCollapsed,
    'pt-14 md:pt-0': true,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFormation((prev) => (prev + 1) % formations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        router.push('/admin');
      } else if (user.role === 'STUDENT') {
        router.push('/aluno');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  useEffect(() => {
    setFaces([
      'https://images.unsplash.com/photo-1672675225389-4d7b6f231f5b?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1656848222673-e07026bb242e?q=80&w=737&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1610903866883-c280999dcc0e?q=80&w=789&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1678282955936-426bbe7a9693?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      'https://images.unsplash.com/photo-1678282955808-de92256dbd59?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?height=80&width=80',
    ]);
  }, []);

  const testimonials = [
    {
      id: 1,
      name: 'Ana Rodrigues',
      course: 'Marketing Digital Avançado',
      rating: 5,
      comment:
        'Os cursos do IMDN transformaram minha carreira. Consegui aplicar os conhecimentos imediatamente no meu trabalho e já vi resultados incríveis!',
      avatar:
        'https://images.unsplash.com/photo-1551524997-bccf2c928f5f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?height=80&width=80',
    },
    {
      id: 2,
      name: 'Carlos Mendes',
      course: 'Desenvolvimento Web Completo',
      rating: 5,
      comment:
        'Excelente plataforma! Os professores são muito qualificados e o conteúdo é atualizado. Recomendo para quem quer se destacar no mercado.',
      avatar:
        'https://images.unsplash.com/photo-1688991021464-106ab5630eb7?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?height=80&width=80',
    },
    {
      id: 3,
      name: 'Beatriz Santos',
      course: 'Design Gráfico Profissional',
      rating: 5,
      comment:
        'Aprendi muito mais do que esperava. A metodologia é clara e os projetos práticos me ajudaram a construir um portfólio profissional.',
      avatar:
        'https://images.unsplash.com/photo-1551524267-c0baf940832c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?height=80&width=80',
    },
  ];

  useEffect(() => {
    const loadFeaturedCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await apiService.getActiveCourses();
        if (response.success && response.data && response.data.courses.length > 0) {
          setFeaturedCourses(response.data.courses.slice(0, 6));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingCourses(false);
      }
    };

    loadFeaturedCourses();
  }, []);

  const scrollToCourses = () => {
    const coursesSection = document.getElementById('cursos-destaque');
    if (coursesSection) {
      coursesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loadingCourses || isLoading) {
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

      <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
        <header className="md:px-6 top-0 md:top-4 mb-6 md:mb-8">
          <div className="relative z-10 w-full px-4 md:px-6 py-12 md:py-20">
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Coluna Esquerda - Texto */}
                <div className="space-y-6">
                  {/* Título com texto animado */}
                  <div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-gray-900 dark:text-white">
                      Formação em
                      <br />
                      <span className="relative inline-block">
                        <span
                          key={currentFormation}
                          className="text-[#DE2535] dark:text-red-400 animate-fade-in"
                          style={{
                            animation: 'fadeIn 0.5s ease-in-out',
                          }}
                        >
                          {formations[currentFormation]}
                        </span>
                      </span>
                    </h1>
                  </div>

                  {/* Subtítulo */}
                  <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                    Instituição Líder em Marketing Digital e Inteligência Artificial em Angola. Desenvolva competências
                    em Marketing Digital aplicado a médias e grandes empresas, explore o poder da Inteligência
                    Artificial para dominar o mercado e aprenda a construir marcas fortes e competitivas.
                  </p>

                  {/* Avatares e estatística */}
                  <div className="flex items-center gap-4 pt-4">
                    <div className="flex -space-x-3">
                      {faces.map((url, idx) => (
                        <img
                          key={idx}
                          src={url || '/placeholder.svg'}
                          alt="Aluno"
                          className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover shadow-md"
                        />
                      ))}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Junte-se a <span className="text-gray-900 dark:text-white font-semibold">centenas de alunos</span>
                    </p>
                  </div>

                  {/* Botão CTA */}
                  <div className="pt-4">
                    <Button
                      size="lg"
                      onClick={scrollToCourses}
                      className="bg-[#DE2535] hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-semibold px-8 py-6 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      Inscreva-se
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Coluna Direita - Imagem/Vídeo */}
                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 aspect-video">
                    <iframe
                      src={getVideoEmbedUrl('https://vimeo.com/1124877716')}
                      frameBorder="0"
                      allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      className="w-full h-full"
                      title="Vídeo de apresentação da IMDN"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 ">
          <div className="px-4 md:px-6 py-12 md:py-16">
            <div className="mx-auto space-y-16">
              {featuredCourses.length > 0 && (
                <section id="cursos-destaque">
                  <div className="mb-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                      Cursos em Destaque
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                      Explore nossa seleção de cursos mais populares
                    </p>
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
                        <Link href={`/detalhes-curso/${course.id}`} className="flex-1 sm:flex-none" key={course.id}>
                          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-700/20 border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg dark:hover:shadow-gray-700/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer">
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

                              <div className="flex items-center justify-between">
                                <div className="text-2xl font-bold text-[#121F3F] dark:text-blue-400">
                                  {course.price === 0 ? (
                                    <span className="text-sm inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 font-semibold">
                                      Grátis
                                    </span>
                                  ) : (
                                    formatKwanza(course.price)
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  <div className="text-center mt-8">
                    <Button
                      size="lg"
                      className="bg-[#121F3F] hover:bg-[#0d1629] dark:bg-gray-700 dark:hover:bg-gray-700 text-white p-4"
                      onClick={() => router.push('/cursos-disponiveis')}
                    >
                      Ver Todos os Cursos
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </section>
              )}

              {/* Como Funciona */}
              <section className="mt-16">
                <div className="mb-10 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">Como Funciona</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
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
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Certificado</h3>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">Receba certificado e conclusão</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* O Que Nossos Alunos Dizem */}
              <section className="mt-16">
                <div className="mb-8 text-center">
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    O Que Nossos Alunos Dizem
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
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

              <section className="mt-16">
                <div className="bg-gradient-to-br from-[#121F3F] to-[#0d1629] dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-8 md:p-12">
                  <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                      Pronto para iniciar a sua jornada rumo ao sucesso?
                    </h2>
                    <p className="text-lg text-gray-200 mb-8 leading-relaxed">
                      Junte-se a centenas de profissionais, empreendedores e acadêmicos que já estão a transformar as
                      suas carreiras com os nossos cursos. Inscreva-se hoje e comece a desenvolver as competências
                      certas. Nos vemos em breve!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        size="lg"
                        className="bg-[#DE2535] hover:bg-[#c41e2a] text-white p-4"
                        onClick={() => router.push('/registrar')}
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

      <a
        href="https://wa.me/447570087886?text=Ol%C3%A1,%20estou%20na%20p%C3%A1gina%20inicial%20da%20IMDN.%20Tenho%20interesse%20nos%20cursos%20e%20gostaria%20de%20tirar%20uma%20d%C3%BAvida.%20Pode%20me%20ajudar?"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
        aria-label="Falar no WhatsApp"
      >
        {/* Ícone do WhatsApp */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.52 3.48A11.87 11.87 0 0012 0C5.373 0 0 5.373 0 12a11.9 11.9 0 001.65 6.09L0 24l5.91-1.56A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22.08a10.08 10.08 0 01-5.43-1.61l-.39-.24-3.51.93.94-3.42-.25-.4A10.05 10.05 0 011.92 12c0-5.56 4.52-10.08 10.08-10.08 2.7 0 5.24 1.05 7.13 2.95a10.02 10.02 0 012.95 7.13c0 5.56-4.52 10.08-10.08 10.08zm5.49-7.65c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15s-.77.97-.95 1.17c-.18.2-.37.22-.68.08-.3-.15-1.27-.47-2.42-1.48-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.12.3-.32.45-.48.15-.15.2-.27.3-.45.1-.18.05-.33-.02-.48-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51-.18 0-.39-.02-.6-.02s-.48.07-.73.35c-.24.27-.93.91-.93 2.22s.95 2.58 1.08 2.76c.12.18 1.86 2.85 4.52 3.99.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.18-.57-.33z" />
        </svg>
      </a>
    </div>
  );
}
