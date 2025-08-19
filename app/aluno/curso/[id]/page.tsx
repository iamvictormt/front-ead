'use client';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
  ShoppingCart,
  Edit3,
  Trash2,
  MoreVertical,
  Edit,
} from 'lucide-react';
import { useSidebar } from '@/contexts/sidebar-context';
import clsx from 'clsx';
import { useToast } from '@/contexts/toast-context';
import { useRouter, useParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CommentItem = ({
  comment,
  depth = 0,
  currentUser,
  replyingTo,
  replyContent,
  editingComment,
  editContent,
  onReplyToggle,
  onReplyContentChange,
  onAddReply,
  onEditToggle,
  onEditContentChange,
  onEditComment,
  onDeleteComment,
}: {
  comment: Comment;
  depth?: number;
  currentUser: any;
  replyingTo: number | null;
  replyContent: string;
  editingComment: number | null;
  editContent: string;
  onReplyToggle: (commentId: number) => void;
  onReplyContentChange: (content: string) => void;
  onAddReply: (parentId: number) => void;
  onEditToggle: (commentId: number, content: string) => void;
  onEditContentChange: (content: string) => void;
  onEditComment: (commentId: number) => void;
  onDeleteComment: (commentId: number) => void;
}) => {
  console.log(currentUser?.id);
  const isAdmin = comment.user?.role === 'ADMIN';
  const isOwner = comment.user?.id === currentUser?.id;
  const canReply = depth === 0 && currentUser?.role === 'ADMIN' && !isOwner;
  const canEdit = isOwner;
  const canDelete = isOwner || currentUser?.role === 'ADMIN';

  return (
    <div className={`${depth > 0 ? 'ml-2 md:ml-6 border-l-2 border-primary/20 pl-2 md:pl-4' : ''}`}>
      <Card className="bg-card border-border shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-3 md:p-4">
          <div className="flex items-start gap-2 md:gap-3">
            <div
              className={`w-8 h-8 md:w-10 md:h-10 ${
                isAdmin ? 'bg-primary' : 'bg-muted-foreground'
              } rounded-full flex items-center justify-center text-primary-foreground text-xs md:text-sm font-semibold shadow-sm flex-shrink-0`}
            >
              {comment.user.name?.charAt(0).toUpperCase() || 'U'}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2 gap-2">
                <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                  <h5 className="font-semibold text-card-foreground text-sm md:text-base truncate">
                    {comment.user.name}
                  </h5>
                  {isAdmin && (
                    <span className="px-1.5 py-0.5 md:px-2 md:py-1 bg-primary/10 text-primary text-xs rounded-full font-medium border border-primary/20 flex-shrink-0">
                      Professor
                    </span>
                  )}
                </div>

                {(canEdit || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 hover:bg-muted flex-shrink-0 touch-manipulation"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-36">
                      {canEdit && (
                        <DropdownMenuItem
                          onClick={() => onEditToggle(comment.id, comment.content)}
                          className="cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => onDeleteComment(comment.id)}
                          className="text-red-500 focus:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          Excluir
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {editingComment === comment.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => onEditContentChange(e.target.value)}
                    className="min-h-[80px] resize-none text-sm md:text-base"
                    placeholder="Edite seu comentário..."
                  />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      size="sm"
                      onClick={() => onEditComment(comment.id)}
                      disabled={!editContent.trim()}
                      className="w-full sm:w-auto touch-manipulation"
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditToggle(-1, '')}
                      className="w-full sm:w-auto touch-manipulation"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-card-foreground leading-relaxed mb-3 text-sm md:text-base break-words">
                    {comment.content}
                  </p>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground flex-shrink-0 flex">
                        {new Date(comment.updatedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {comment.createdAt !== comment.updatedAt && (
                          <>
                            <Edit className="md:hidden h-4 w-4 ml-1" />
                            <span className="hidden md:inline  ml-1">(editado)</span>
                          </>
                        )}
                      </span>

                      {canReply && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReplyToggle(comment.id)}
                          className="text-primary hover:text-primary/80 h-8 px-2 py-1 touch-manipulation flex-shrink-0"
                        >
                          <MessageCircle className="hidden md:inline h-4 w-4 mr-1" />
                          <span className="text-sm">Responder</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {replyingTo === comment.id && (
            <div className="mt-4 space-y-3 p-3 bg-muted/50 rounded-lg border border-border">
              <Textarea
                placeholder="Digite sua resposta..."
                value={replyContent}
                onChange={(e) => onReplyContentChange(e.target.value)}
                className="min-h-[80px] resize-none bg-background text-sm md:text-base"
                rows={3}
              />
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  size="sm"
                  onClick={() => onAddReply(comment.id)}
                  disabled={!replyContent.trim()}
                  className="w-full sm:w-auto touch-manipulation"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Enviar Resposta
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onReplyToggle(-1)}
                  className="w-full sm:w-auto touch-manipulation"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 md:mt-4 space-y-3 md:space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              currentUser={currentUser}
              replyingTo={replyingTo}
              replyContent={replyContent}
              editingComment={editingComment}
              editContent={editContent}
              onReplyToggle={onReplyToggle}
              onReplyContentChange={onReplyContentChange}
              onAddReply={onAddReply}
              onEditToggle={onEditToggle}
              onEditContentChange={onEditContentChange}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CursoPage() {
  const { isCollapsed } = useSidebar();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isCollapsed);
  const [selectedCourse, setSelectedCourse] = useState<MyCourse | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMarkLesson, setLoadingMarkLesson] = useState(false);
  const [courseCompleted, setCourseCompleted] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingLessonAction, setPendingLessonAction] = useState<{
    lessonId: number;
    completed: boolean;
  } | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { success, error: showError } = useToast();
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isSidebarCollapsed,
    'md:ml-80': !isSidebarCollapsed,
  });

  const handleReplyToggle = useCallback(
    (commentId: number) => {
      setReplyingTo(replyingTo === commentId ? null : commentId);
      if (replyingTo !== commentId) {
        setReplyContent('');
      }
    },
    [replyingTo]
  );

  const handleReplyContentChange = useCallback((content: string) => {
    setReplyContent(content);
  }, []);

  const handleEditToggle = useCallback((commentId: number, content: string) => {
    if (commentId === -1) {
      setEditingComment(null);
      setEditContent('');
    } else {
      setEditingComment(commentId);
      setEditContent(content);
    }
  }, []);

  const handleEditContentChange = useCallback((content: string) => {
    setEditContent(content);
  }, []);

  const handleDeleteComment = useCallback((commentId: number) => {
    setCommentToDelete(commentId);
    setShowDeleteDialog(true);
  }, []);

  useEffect(() => {
    if (courseId) {
      loadCourseDetails(courseId);
      loadCurrentUser();
    }
  }, [courseId]);

  const loadCurrentUser = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setCurrentUser(response.data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadCourseDetails = async (courseId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getCourseDetails(courseId);
      if (response.success && response.data) {
        setSelectedCourse(response.data);
        if (response.data.modules && response.data.modules.length > 0 && response.data.modules[0].lessons.length > 0) {
          setSelectedLesson(response.data.modules[0].lessons[0]);
        }

        if (response?.data.certificate) {
          setCourseCompleted(true);
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
      if (videoUrl.includes('player.vimeo.com/video')) {
        return videoUrl;
      }

      const parts = videoUrl.split('vimeo.com/')[1];
      return `https://player.vimeo.com/video/${parts}`;
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
        success('Comentário adicionado com sucesso');
      } else {
        showError(response.error || 'Erro ao adicionar comentário');
      }
    } catch (error) {
      showError('Erro ao adicionar comentário');
    }
  };

  const addReply = async (parentId: number) => {
    if (!replyContent.trim() || !selectedLessonId) return;

    const parentComment = findCommentById(comments, parentId);
    if (!parentComment) return;

    if (parentComment.user.id === currentUser?.id) {
      showError('Você não pode responder ao seu próprio comentário');
      return;
    }

    if (currentUser?.role !== 'ADMIN') {
      showError('Apenas professores podem responder comentários');
      return;
    }

    try {
      const response = await apiService.addLessonComment(selectedLessonId, replyContent, parentComment.id);
      if (response.success && response.data) {
        await loadLessonComments(selectedLessonId);
        setReplyContent('');
        setReplyingTo(null);
        success('Resposta adicionada com sucesso');
      } else {
        showError(response.error || 'Erro ao adicionar resposta');
      }
    } catch (error) {
      showError('Erro ao adicionar resposta');
    }
  };

  function findCommentById(comments: Comment[], id: number): Comment | null {
    for (const comment of comments) {
      if (comment.id === id) {
        // se o id for do comment raiz
        return comment;
      }

      if (comment.replies) {
        const reply = comment.replies.find((r) => r.id === id);
        if (reply) {
          // se o id for de um reply, retornamos o comment raiz
          return comment;
        }
      }
    }
    return null;
  }

  const editComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      const response = await apiService.updateComment(commentId, editContent);
      if (response.success) {
        await loadLessonComments(selectedLessonId!);
        setEditingComment(null);
        setEditContent('');
        success('Comentário editado com sucesso');
      } else {
        showError(response.error || 'Erro ao editar comentário');
      }
    } catch (error) {
      showError('Erro ao editar comentário');
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      const response = await apiService.deleteComment(commentId);
      if (response.success) {
        await loadLessonComments(selectedLessonId!);
        success('Comentário excluído com sucesso');
      } else {
        showError(response.error || 'Erro ao excluir comentário');
      }
    } catch (error) {
      showError('Erro ao excluir comentário');
    }
  };

  const markLessonComplete = async (lessonId: number, completed: boolean) => {
    if (!selectedCourse) return;

    if (completed && !selectedCourse.certificate) {
      const allLessons = selectedCourse.modules?.flatMap((module) => module.lessons) || [];
      const uncompletedLessons = allLessons.filter((lesson) => !lesson.completed);

      if (uncompletedLessons.length === 1 && uncompletedLessons[0].id === lessonId) {
        setPendingLessonAction({ lessonId, completed });
        setShowConfirmDialog(true);
        return;
      }
    }

    await executeMarkLessonComplete(lessonId, completed);
  };

  const executeMarkLessonComplete = async (lessonId: number, completed: boolean) => {
    if (!selectedCourse) return;

    try {
      setLoadingMarkLesson(true);
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

        if (completed && pendingLessonAction) {
          setCourseCompleted(true);
        }
      } else {
        showError(response.error || 'Erro ao atualizar progresso da aula');
      }
      setLoadingMarkLesson(false);
    } catch (error) {
      showError('Erro ao atualizar progresso da aula');
      setLoadingMarkLesson(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (pendingLessonAction) {
      await executeMarkLessonComplete(pendingLessonAction.lessonId, pendingLessonAction.completed);
      setPendingLessonAction(null);
    }
    setShowConfirmDialog(false);
  };

  const handleCancelCompletion = () => {
    setPendingLessonAction(null);
    setShowConfirmDialog(false);
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['STUDENT']}>
        <div className="min-h-screen bg-background flex items-center justify-center">
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
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Curso não encontrado</p>
            <Button onClick={() => router.push('/aluno/meus-cursos')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Cursos
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const allLessons = selectedCourse.modules?.flatMap((module) => module.lessons) || [];
  const currentLessonIndex = selectedLesson ? allLessons.findIndex((lesson) => lesson.id === selectedLesson.id) : -1;

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-background">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Comentário</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (commentToDelete) {
                    deleteComment(commentToDelete);
                    setCommentToDelete(null);
                  }
                  setShowDeleteDialog(false);
                }}
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finalizar Curso</DialogTitle>
              <DialogDescription>
                Esta é a última aula do curso. Ao concluí-la, seu certificado será emitido automaticamente e não será
                mais possível alterar o progresso.
                <br />
                <br />
                Você poderá rever todas as aulas a qualquer momento.
                <br />
                <br />
                Deseja prosseguir?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={handleCancelCompletion}>
                Não
              </Button>
              <Button onClick={handleConfirmCompletion}>Sim, finalizar curso</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
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

          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto space-y-6">
                <div className="flex items-start gap-6 bg-white rounded-lg shadow-sm p-4 md:p-6">
                  <img
                    src={selectedCourse.thumbnailUrl || '/placeholder.svg?height=200&width=300'}
                    alt={selectedCourse.title}
                    className="w-60 h-32 object-cover rounded-lg hidden md:block"
                  />
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">{selectedCourse.title}</h2>
                    <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                    <div className="flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 bg-yellow-100 rounded-md px-3 py-1 text-yellow-600">
                        <Star className="w-4 h-4" />
                        <span className="text-sm font-medium">{selectedCourse.rating || 0.0} avaliações</span>
                      </div>

                      <div className="flex items-center gap-2 bg-blue-100 rounded-md px-3 py-1 text-blue-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm font-medium">{selectedCourse.studentsCount || 0} alunos</span>
                      </div>

                      <div className="flex items-center gap-2 bg-green-100 rounded-md px-3 py-1 text-green-600">
                        <ShoppingCart className="w-4 h-4 " />
                        <span className="text-sm font-medium ">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                            selectedCourse.pricePaid
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedLesson && (
                  <Card className="overflow-hidden py-0">
                    <CardContent className="p-0">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                        <div className="lg:col-span-2 bg-[#2D2D2D]">
                          <div className="aspect-video w-full">
                            {selectedLesson.videoUrl.includes('youtube') ||
                            selectedLesson.videoUrl.includes('vimeo') ? (
                              <iframe
                                src={getVideoEmbedUrl(selectedLesson.videoUrl)}
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                className="w-full h-full"
                                title="Optimizing Video Thumbnails"
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

                          <div className="bg-[#2D2D2D] rounded-2xl text-white p-4">
                            <div className="grid md:flex items-center md:justify-between mb-3">
                              <h3 className="text-lg font-semibold md:w-[75%] mb-2 md:mb-0">{selectedLesson.title}</h3>
                              {!courseCompleted && (
                                <Button
                                  size="sm"
                                  variant={selectedLesson.completed ? 'default' : 'secondary'}
                                  disabled={loadingMarkLesson}
                                  onClick={() => markLessonComplete(selectedLesson.id, !selectedLesson.completed)}
                                  className={
                                    selectedLesson.completed ? 'bg-green-600 hover:bg-green-700 cursor-pointer' : ''
                                  }
                                >
                                  {selectedLesson.completed ? (
                                    <>
                                      {!loadingMarkLesson ? (
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                      ) : (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      )}
                                      Concluída
                                    </>
                                  ) : (
                                    <>
                                      {!loadingMarkLesson ? (
                                        <PlayCircle className="w-4 h-4 mr-1" />
                                      ) : (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                      )}
                                      Marcar como Concluída
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>

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

                <Tabs defaultValue="materiais" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="materiais">Materiais</TabsTrigger>
                    <TabsTrigger value="duvidas">Dúvidas</TabsTrigger>
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
                          <div className="text-center py-12">
                            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Nenhum material anexado.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="duvidas" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          Dúvidas e Comentários
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {selectedLesson && (
                            <>
                              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                                <p className="text-sm text-primary font-medium mb-2">
                                  Comentários para: <strong>{selectedLesson.title}</strong>
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => loadLessonComments(selectedLesson.id)}
                                  className="border-primary/20 text-primary hover:bg-primary/10"
                                >
                                  Carregar Comentários
                                </Button>
                              </div>

                              {selectedLessonId === selectedLesson.id && (
                                <>
                                  <div className="space-y-6">
                                    {comments.length > 0 ? (
                                      comments.map((comment) => (
                                        <CommentItem
                                          key={comment.id}
                                          comment={comment}
                                          currentUser={currentUser}
                                          replyingTo={replyingTo}
                                          replyContent={replyContent}
                                          editingComment={editingComment}
                                          editContent={editContent}
                                          onReplyToggle={handleReplyToggle}
                                          onReplyContentChange={handleReplyContentChange}
                                          onAddReply={addReply}
                                          onEditToggle={handleEditToggle}
                                          onEditContentChange={handleEditContentChange}
                                          onEditComment={editComment}
                                          onDeleteComment={handleDeleteComment}
                                        />
                                      ))
                                    ) : (
                                      <div className="text-center py-12">
                                        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                        <p className="text-muted-foreground">
                                          Nenhum comentário ainda. Seja o primeiro a comentar!
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  <Card className="border-primary/20">
                                    <CardHeader>
                                      <CardTitle className="text-lg">Adicionar Comentário</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <Textarea
                                        placeholder="Digite sua dúvida ou comentário..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="min-h-[100px] resize-none"
                                        rows={4}
                                      />
                                      <Button
                                        onClick={addComment}
                                        disabled={!newComment.trim()}
                                        className="w-full sm:w-auto"
                                      >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Enviar Comentário
                                      </Button>
                                    </CardContent>
                                  </Card>
                                </>
                              )}
                            </>
                          )}
                          {!selectedLesson && (
                            <div className="text-center py-12">
                              <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                              <p className="text-muted-foreground">
                                Selecione uma aula para ver os comentários e adicionar dúvidas
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
