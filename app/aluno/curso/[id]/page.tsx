'use client';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { apiService, type MyCourse, type Comment } from '@/lib/api';
import {
  Download,
  FileText,
  MessageCircle,
  CheckCircle,
  PlayCircle,
  Users,
  Star,
  Loader2,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Award,
  Clock,
  ShoppingCart,
} from 'lucide-react';
import { useSidebar } from '@/contexts/sidebar-context';
import clsx from 'clsx';
import { useToast } from '@/contexts/toast-context';
import { useRouter, useParams } from 'next/navigation';

export default function CursoPage() {
  const { isCollapsed } = useSidebar();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isCollapsed);
  const [selectedCourse, setSelectedCourse] = useState<MyCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const { success, error: showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isSidebarCollapsed,
    'md:ml-80': !isSidebarCollapsed,
  });

  useEffect(() => {
    if (courseId) {
      loadCourseDetails(courseId);
    }
  }, [courseId]);

  const loadCourseDetails = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getCourseDetails(courseId);
      if (response.success && response.data) {
        setSelectedCourse(response.data);
        if (response.data.modules && response.data.modules.length > 0 && response.data.modules[0].lessons.length > 0) {
          setSelectedLesson(response.data.modules[0].lessons[0]);
        }
      } else {
        showError(response.error || 'Erro ao carregar detalhes do curso');
      }
    } catch (error) {
      showError('Erro ao carregar detalhes do curso');
    } finally {
      setLoading(false);
    }
  };

  const getVideoEmbedUrl = (videoUrl: string) => {
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const videoId = videoUrl.includes('youtu.be')
        ? videoUrl.split('youtu.be/')[1]?.split('?')[0]
        : videoUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (videoUrl.includes('vimeo.com')) {
      const videoId = videoUrl.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    return videoUrl;
  };

  const navigateLesson = (direction: 'prev' | 'next') => {
    if (!selectedCourse || !selectedLesson) return;

    const allLessons = selectedCourse.modules?.flatMap((module) => module.lessons) || [];
    const currentIndex = allLessons.findIndex((lesson) => lesson.id === selectedLesson.id);

    if (direction === 'prev' && currentIndex > 0) {
      setSelectedLesson(allLessons[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < allLessons.length - 1) {
      setSelectedLesson(allLessons[currentIndex + 1]);
    }
  };

  const loadLessonComments = async (lessonId: number) => {
    try {
      const response = await apiService.getLessonComments(lessonId);
      if (response.success && response.data) {
        setComments(response.data);
        setSelectedLessonId(lessonId);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar comentários',
        variant: 'destructive',
      });
    }
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedLessonId) return;

    try {
      const response = await apiService.addLessonComment(selectedLessonId, newComment);
      if (response.success && response.data) {
        setComments([...comments, response.data]);
        setNewComment('');
        toast({
          title: 'Sucesso',
          description: 'Comentário adicionado com sucesso',
        });
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar comentário',
        variant: 'destructive',
      });
    }
  };

  const markLessonComplete = async (lessonId: number, completed: boolean) => {
    if (!selectedCourse) return;
    try {
      const response = await apiService.updateLessonProgress(selectedCourse?.id, lessonId, completed);
      if (response.success) {
        setSelectedLesson({ ...selectedLesson, completed });
        setSelectedCourse({
          ...selectedCourse,
          modules: selectedCourse.modules.map((module) => ({
            ...module,
            lessons: module.lessons.map((lesson) => (lesson.id === lessonId ? { ...lesson, completed } : lesson)),
          })),
        });
        success(completed ? 'Aula marcada como concluída' : 'Aula desmarcada como concluída');
      }
    } catch (error) {
      showError('Erro ao atualizar progresso da aula');
    }
  };

  const generateCertificate = async (courseId: string) => {
    try {
      const response = await apiService.generateCertificate(courseId);
      if (response.success && response.data) {
        toast({
          title: 'Sucesso',
          description: 'Certificado gerado com sucesso',
        });
        loadCourseDetails(courseId);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao gerar certificado',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Carregando curso...</span>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!selectedCourse) {
    return (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Curso não encontrado</p>
            <Button onClick={() => router.push('/aluno/meus-cursos')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Cursos
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const progressPercentage = selectedCourse.progress
    ? (selectedCourse.progress.completedLessons / selectedCourse.progress.totalLessons) * 100
    : 0;

  const allLessons = selectedCourse.modules?.flatMap((module) => module.lessons) || [];
  const currentLessonIndex = selectedLesson ? allLessons.findIndex((lesson) => lesson.id === selectedLesson.id) : -1;

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-gray-50">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#2D2D2D] md:bg-white md:rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 ml-12 md:ml-0">
                  Assistindo Curso
                </h1>
                <Button variant="outline" onClick={() => router.push('/aluno/meus-cursos')}>
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  <span className="hidden md:inline">Voltar aos Cursos</span>
                  <span className="md:hidden">Voltar</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto space-y-6">
                {/* Course Header */}
                <div className="flex items-start gap-6 bg-white rounded-lg shadow-sm p-4 md:p-6">
                  <img
                    src={selectedCourse.thumbnailUrl || '/placeholder.svg?height=200&width=300'}
                    alt={selectedCourse.title}
                    className="w-60 h-32 object-cover rounded-lg hidden md:block"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedCourse.title}</h2>
                    <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-yellow-400">
                          <Star className="w-4 h-4 text-white" />
                        </div>
                        <span>{selectedCourse.rating || 0.0} avaliações</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-blue-400">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span>{selectedCourse.studentsCount || 0} alunos</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <div className="w-8 h-8 flex items-center justify-center rounded-md bg-green-400">
                          <ShoppingCart className="w-4 h-4 text-white" />
                        </div>
                        <span>
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(selectedCourse.pricePaid)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Player Section */}
                {selectedLesson && (
                  <Card className="overflow-hidden py-0">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                        {/* Video Player */}
                        <div className="lg:col-span-2 bg-[#2D2D2D]">
                          <div className="aspect-video w-full">
                            {selectedLesson.videoUrl.includes('youtube') ||
                            selectedLesson.videoUrl.includes('vimeo') ? (
                              <iframe
                                src={getVideoEmbedUrl(selectedLesson.videoUrl)}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={selectedLesson.videoUrl}
                                className="w-full h-full"
                                controls
                                preload="metadata"
                              />
                            )}
                          </div>

                          {/* Video Controls */}
                          <div className="bg-[#2D2D2D] rounded-2xl text-white p-4">
                            <div className="grid md:flex items-center justify-between mb-3">
                              <h3 className="text-lg font-semibold md:w-[75%] mb-2 md:mb-0">{selectedLesson.title}</h3>
                              <Button
                                size="sm"
                                variant={selectedLesson.completed ? 'default' : 'secondary'}
                                onClick={() => markLessonComplete(selectedLesson.id, !selectedLesson.completed)}
                                className={
                                  selectedLesson.completed ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : ''
                                }
                              >
                                {selectedLesson.completed ? (
                                  <>
                                    <CheckCircle className="w-4 h-4 mr-1" />
                                    Concluída
                                  </>
                                ) : (
                                  <>
                                    <PlayCircle className="w-4 h-4 mr-1" />
                                    Marcar como Concluída
                                  </>
                                )}
                              </Button>
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigateLesson('prev')}
                                disabled={currentLessonIndex <= 0}
                                className="bg-transparent text-white cursor-pointer"
                              >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Anterior
                              </Button>

                              <span className="text-sm text-gray-300">
                                Aula {currentLessonIndex + 1} de {allLessons.length}
                              </span>

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigateLesson('next')}
                                disabled={currentLessonIndex >= allLessons.length - 1}
                                className="bg-transparent text-white cursor-pointer"
                              >
                                Próxima
                                <ChevronRight className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Lesson List Sidebar */}
                        <div className="max-h-96 lg:max-h-[600px] overflow-y-auto">
                          <div className="p-4 border-b bg-white">
                            <h4 className="font-semibold text-gray-900">Conteúdo do Curso</h4>
                          </div>
                          <div className="space-y-1">
                            {selectedCourse.modules?.map((module) => (
                              <div key={module.id}>
                                <div className="px-4 py-2 bg-gray-100 border-b">
                                  <h5 className="font-medium text-sm text-gray-700">{module.title}</h5>
                                </div>
                                {module.lessons.map((lesson) => {
                                  const isCurrentLesson = selectedLesson?.id === lesson.id;

                                  return (
                                    <button
                                      key={lesson.id}
                                      onClick={() => setSelectedLesson(lesson)}
                                      className={`w-full text-left px-4 py-3 cursor-pointer ${
                                        isCurrentLesson
                                          ? 'bg-[#2D2D2D] border-r-2 border-[#2D2D2D]'
                                          : 'hover:bg-gray-100 transition-colors '
                                      }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        {lesson.completed ? (
                                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <PlayCircle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p
                                            className={`text-sm font-medium truncate ${
                                              isCurrentLesson ? 'text-white' : 'text-gray-900'
                                            }`}
                                          >
                                            {lesson.title}
                                          </p>
                                          <p className="text-xs text-gray-500">
                                            {lesson.videoUrl.includes('youtube')
                                              ? 'YouTube'
                                              : lesson.videoUrl.includes('vimeo')
                                              ? 'Vimeo'
                                              : 'Vídeo'}
                                          </p>
                                        </div>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tabs for additional content */}
                {/* <Tabs defaultValue="materiais" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="materiais">Materiais</TabsTrigger>
                    <TabsTrigger value="duvidas">Dúvidas</TabsTrigger>
                    <TabsTrigger value="certificado">Certificado</TabsTrigger>
                  </TabsList>

                  <TabsContent value="materiais" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Materiais Complementares</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedCourse.modules
                            ?.flatMap((module) => module.lessons.filter((lesson) => lesson.pdfUrl))
                            .map((lesson) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <FileText className="w-5 h-5 text-red-500" />
                                  <div>
                                    <h4 className="font-medium">{lesson.title} - Material</h4>
                                    <p className="text-sm text-gray-500">PDF</p>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(lesson.pdfUrl, '_blank')}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="duvidas" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Dúvidas e Comentários</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedLesson && (
                            <>
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  Comentários para: <strong>{selectedLesson.title}</strong>
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => loadLessonComments(selectedLesson.id)}
                                  className="mt-2"
                                >
                                  Carregar Comentários
                                </Button>
                              </div>

                              {selectedLessonId === selectedLesson.id && (
                                <>
                                  <div className="space-y-3">
                                    {comments.map((comment) => (
                                      <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-start gap-3">
                                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                                            {comment.userName?.charAt(0) || 'U'}
                                          </div>
                                          <div className="flex-1">
                                            <h5 className="font-medium">{comment.userName}</h5>
                                            <p className="text-sm text-gray-600 mt-1">{comment.content}</p>
                                            <p className="text-xs text-gray-400 mt-2">
                                              {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="space-y-2">
                                    <Textarea
                                      placeholder="Digite sua dúvida ou comentário..."
                                      value={newComment}
                                      onChange={(e) => setNewComment(e.target.value)}
                                    />
                                    <Button onClick={addComment} disabled={!newComment.trim()}>
                                      <MessageCircle className="w-4 h-4 mr-1" />
                                      Enviar
                                    </Button>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          {!selectedLesson && (
                            <p className="text-gray-500 text-center py-8">
                              Selecione uma aula para ver os comentários e adicionar dúvidas
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="certificado" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Certificado de Conclusão</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedCourse.certificate ? (
                          <div className="text-center space-y-4">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                              <Award className="w-12 h-12 text-green-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-green-800">Parabéns!</h3>
                              <p className="text-gray-600">Você concluiu este curso com sucesso</p>
                              <p className="text-sm text-gray-500">
                                Certificado emitido em{' '}
                                {new Date(selectedCourse.certificate.issuedAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => window.open(selectedCourse.certificate?.url, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Baixar Certificado PDF
                            </Button>
                          </div>
                        ) : (
                          <div className="text-center space-y-4">
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                              <Award className="w-12 h-12 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-gray-600">Certificado não disponível</h3>
                              <p className="text-gray-500">Complete todas as aulas para receber seu certificado</p>
                              <div className="mt-4">
                                <Progress value={progressPercentage} className="w-full max-w-xs mx-auto" />
                                <p className="text-sm text-gray-500 mt-2">
                                  {selectedCourse.progress?.completedLessons || 0} de{' '}
                                  {selectedCourse.progress?.totalLessons || 0} aulas concluídas
                                </p>
                              </div>
                              {progressPercentage === 100 && (
                                <Button
                                  className="mt-4"
                                  onClick={() => generateCertificate(selectedCourse.id.toString())}
                                >
                                  <Award className="w-4 h-4 mr-2" />
                                  Gerar Certificado
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs> */}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
