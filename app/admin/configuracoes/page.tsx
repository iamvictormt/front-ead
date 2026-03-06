'use client';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, Lock, Mail, User2, Info, BadgeInfo, Video, Link2, ExternalLink, Play, Search, ShoppingCart, Copy, Check, X } from 'lucide-react';
import { LoadingSpinner } from '@/components/loading-spinner';
import { apiService, type User, type CourseAvailable } from '@/lib/api';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/contexts/toast-context';
import { useSidebar } from '@/contexts/sidebar-context';
import clsx from 'clsx';
import { Footer } from '@/components/footer';

export default function ConfigAdminPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isCollapsed,
    'md:ml-80': !isCollapsed,
    'pt-14 md:pt-0': true,
  });

  const [admins, setAdmins] = useState<User[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);
  const [showAddAdminDialog, setShowAddAdminDialog] = useState(false);
  const [newAdminData, setNewAdminData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<User | null>(null);

  // Video settings state
  const [videoUrl, setVideoUrl] = useState('');
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [loadingVideoSettings, setLoadingVideoSettings] = useState(true);

  // Export Link state
  const [courses, setCourses] = useState<CourseAvailable[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [selectedCourses, setSelectedCourses] = useState<CourseAvailable[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    loadAdmins();
    loadVideoSettings();
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const response = await apiService.getAllCourses();
      if (response.success && response.data) {
        // Filtrar apenas cursos ativos (sem deactivatedIn)
        const activeCourses = response.data.filter(course => !course.deactivatedIn);
        setCourses(activeCourses);
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    const searchLower = courseSearchTerm.toLowerCase();
    return (
      course.title?.toLowerCase().includes(searchLower) ||
      course.instructor?.toLowerCase().includes(searchLower) ||
      course.category?.toLowerCase().includes(searchLower)
    );
  });

  const handleToggleCourse = (course: CourseAvailable) => {
    setSelectedCourses((prev) => {
      const isSelected = prev.some((c) => c.id === course.id);
      if (isSelected) {
        return prev.filter((c) => c.id !== course.id);
      }
      return [...prev, course];
    });
    setGeneratedLink('');
    setLinkCopied(false);
  };

  const handleRemoveSelectedCourse = (courseId: number) => {
    setSelectedCourses((prev) => prev.filter((c) => c.id !== courseId));
    setGeneratedLink('');
    setLinkCopied(false);
  };

  const handleGenerateLink = () => {
    if (selectedCourses.length === 0) {
      showError('Selecione pelo menos um curso');
      return;
    }

    const courseIds = selectedCourses.map((c) => c.id).join(',');
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/comprar?cursos=${courseIds}`;
    setGeneratedLink(link);
    setLinkCopied(false);
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      success('Link copiado para a área de transferência!');
      setTimeout(() => setLinkCopied(false), 3000);
    } catch (error) {
      console.error('Erro ao copiar link:', error);
      showError('Erro ao copiar link');
    }
  };

  const handleClearSelection = () => {
    setSelectedCourses([]);
    setGeneratedLink('');
    setLinkCopied(false);
  };

  const loadVideoSettings = async () => {
    try {
      setLoadingVideoSettings(true);
      const result = await apiService.getHomepageSettings();
      console.log(result)
      if (result.success && result.data) {
        const { videoUrl } = result.data;
        setVideoUrl(videoUrl);
        console.log(videoUrl)

      }
    } catch (error) {
      console.error('Erro ao carregar configurações do vídeo:', error);
    } finally {
      setLoadingVideoSettings(false);
    }
  };

  const handleSaveVideoUrl = async () => {
    if (videoUrl && !/^https?:\/\/\S+$/.test(videoUrl.trim())) {
      showError('Por favor, insira um link de vídeo válido');
      return;
    }
    if (!videoUrl?.trim()) {
      showError('Por favor, insira um link de vídeo válido');
      return;
    }

    setIsSavingVideo(true);
    try {
      const result = await apiService.updateHomepageSettings({ videoUrl: videoUrl?.trim() });
      if (result.success) {
        success('Link do vídeo atualizado com sucesso!');
      } else {
        showError(result.error || 'Não foi possível salvar o link do vídeo');
      }
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      showError('Erro ao salvar configurações');
    } finally {
      setIsSavingVideo(false);
    }
  };

  const getVideoEmbedUrl = (url: string): string => {
    if (!url) return '';

    // YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }

    return url;
  };

  const loadAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const result = await apiService.getAllAdmins();
      if (result.success && result.data) {
        setAdmins(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar admins:', error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const handleSave = () => {};

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword);

      if (result.success) {
        success('Senha alterada com sucesso!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        showError(result.error || 'Não foi possível alterar a senha');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showError('Erro ao alterar senha');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleCreateAdmin = async () => {
    if (newAdminData.password !== newAdminData.confirmPassword) {
      showError('As senhas não coincidem');
      return;
    }

    if (newAdminData.password.length < 6) {
      showError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setIsCreatingAdmin(true);
      const result = await apiService.createAdmin({
        name: newAdminData.name,
        email: newAdminData.email,
        password: newAdminData.password,
      });

      if (result.success) {
        success('Administrador criado com sucesso!');
        setShowAddAdminDialog(false);
        setNewAdminData({ name: '', email: '', password: '', confirmPassword: '' });
        loadAdmins();
      } else {
        showError(result.error || 'Não foi possível criar o administrador');
      }
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      showError('Erro ao criar administrador');
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    if (adminId === user?.id) {
      showError('Você não pode remover sua própria conta');
      return;
    }

    const adminToRemove = admins.find((admin) => admin.id === adminId);
    if (adminToRemove) {
      setAdminToDelete(adminToRemove);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteAdmin = async () => {
    if (!adminToDelete) return;

    try {
      await apiService.deleteAdmin(adminToDelete.id);
      loadAdmins();
      success('Administrador removido com sucesso!');
      setShowDeleteDialog(false);
      setAdminToDelete(null);
    } catch (error) {
      console.error('Erro ao remover admin:', error);
      showError('Erro ao remover administrador');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CollapsibleSidebar onToggle={setIsCollapsed} />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-white dark:bg-gray-800 md:rounded-lg shadow-sm dark:shadow-gray-700/20 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
                      </div>
                      <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1">
                        Gerencie as configurações do sistema
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto">
                <Tabs defaultValue="pagina-inicial" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger
                      value="pagina-inicial"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs sm:text-sm"
                    >
                      Página Inicial
                    </TabsTrigger>
                    <TabsTrigger
                      value="exportar-link"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs sm:text-sm"
                    >
                      Exportar Link
                    </TabsTrigger>
                    <TabsTrigger
                      value="seguranca"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs sm:text-sm"
                    >
                      Segurança
                    </TabsTrigger>
                    <TabsTrigger
                      value="administradores"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-xs sm:text-sm"
                    >
                      Administradores
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab Página Inicial - Vídeo */}
                  <TabsContent value="pagina-inicial">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <CardTitle className="text-gray-900 dark:text-white">Vídeo da Página Inicial</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                              Configure o vídeo de apresentação exibido na página inicial
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {loadingVideoSettings ? (
                          <div className="flex items-center justify-center py-8">
                            <LoadingSpinner />
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Coluna da esquerda - Formulário */}
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="videoUrl" className="text-gray-700 dark:text-gray-300">
                                  Link do Vídeo
                                </Label>
                                <div className="relative">
                                  <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                  <Input
                                    id="videoUrl"
                                    type="url"
                                    value={videoUrl}
                                    onChange={(e) => setVideoUrl(e.target.value)}
                                    placeholder="https://vimeo.com/1234567890"
                                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                  />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  Suporta links do Vimeo e YouTube
                                </p>
                              </div>

                              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                                  <Info className="w-4 h-4 mr-2" />
                                  Formatos Suportados
                                </h4>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                                  <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    <span>
                                      <strong>Vimeo:</strong> https://vimeo.com/123456789
                                    </span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    <span>
                                      <strong>YouTube:</strong> https://youtube.com/watch?v=abc123
                                    </span>
                                  </li>
                                  <li className="flex items-start">
                                    <span className="text-blue-500 mr-2">•</span>
                                    <span>
                                      <strong>YouTube:</strong> https://youtu.be/abc123
                                    </span>
                                  </li>
                                </ul>
                              </div>

                              <div className="pt-2">
                                <Button
                                  onClick={handleSaveVideoUrl}
                                  disabled={isSavingVideo || !videoUrl?.trim()}
                                  className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 disabled:opacity-50"
                                >
                                  {isSavingVideo ? (
                                    <>
                                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                      Salvando...
                                    </>
                                  ) : (
                                    <>
                                      <Video className="w-4 h-4 mr-2" />
                                      Salvar Alterações
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Coluna da direita - Preview */}
                            <div className="space-y-3">
                              <Label className="text-gray-700 dark:text-gray-300">Pré-visualização</Label>
                              <div className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-700">
                                {videoUrl && /^https?:\/\/\S+$/.test(videoUrl.trim()) ? (
                                  <iframe
                                    src={getVideoEmbedUrl(videoUrl) || '' }
                                    frameBorder="0"
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    className="w-full h-full"
                                    title="Pré-visualização do vídeo"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
                                    <div className="text-center">
                                      <Play className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                      <p className="text-sm">Insira um link para ver a pré-visualização</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
)}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Tab Exportar Link */}
                  <TabsContent value="exportar-link">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <CardTitle className="text-gray-900 dark:text-white">Exportar Link de Compra</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                              Gere links parametrizados para redirecionar usuários diretamente ao carrinho com cursos pré-selecionados
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Coluna da esquerda - Busca e seleção de cursos */}
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-gray-700 dark:text-gray-300">
                                Buscar Cursos
                              </Label>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                <Input
                                  type="text"
                                  value={courseSearchTerm}
                                  onChange={(e) => setCourseSearchTerm(e.target.value)}
                                  placeholder="Buscar por nome, instrutor ou categoria..."
                                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                              </div>
                            </div>

                            {/* Lista de cursos */}
                            <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-80 overflow-y-auto">
                              {loadingCourses ? (
                                <div className="flex items-center justify-center py-8">
                                  <LoadingSpinner />
                                </div>
                              ) : filteredCourses.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                  <Search className="w-8 h-8 mb-2 opacity-50" />
                                  <p className="text-sm">Nenhum curso encontrado</p>
                                </div>
                              ) : (
                                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                  {filteredCourses.map((course) => {
                                    const isSelected = selectedCourses.some((c) => c.id === course.id);
                                    return (
                                      <div
                                        key={course.id}
                                        onClick={() => handleToggleCourse(course)}
                                        className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                                          isSelected
                                            ? 'bg-green-50 dark:bg-green-900/20'
                                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                      >
                                        <Checkbox
                                          checked={isSelected}
                                          onCheckedChange={() => handleToggleCourse(course)}
                                          className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                        />
                                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                                          <img
                                            src={course.thumbnailUrl || '/placeholder.svg?height=48&width=48'}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {course.title}
                                          </p>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {course.instructor} • {course.category}
                                          </p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Coluna da direita - Cursos selecionados e link gerado */}
                          <div className="space-y-4">
                            {/* Cursos selecionados */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-gray-700 dark:text-gray-300">
                                  Cursos Selecionados ({selectedCourses.length})
                                </Label>
                                {selectedCourses.length > 0 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleClearSelection}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 h-8 px-2"
                                  >
                                    <X className="w-4 h-4 mr-1" />
                                    Limpar
                                  </Button>
                                )}
                              </div>
                              <div className="border border-gray-200 dark:border-gray-700 rounded-lg min-h-32 max-h-48 overflow-y-auto">
                                {selectedCourses.length === 0 ? (
                                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                                    <ShoppingCart className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm">Selecione cursos na lista ao lado</p>
                                  </div>
                                ) : (
                                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {selectedCourses.map((course) => (
                                      <div
                                        key={course.id}
                                        className="p-2 flex items-center gap-2"
                                      >
                                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                                          <img
                                            src={course.thumbnailUrl || '/placeholder.svg?height=40&width=40'}
                                            alt={course.title}
                                            className="w-full h-full object-cover"
                                          />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {course.title}
                                          </p>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleRemoveSelectedCourse(course.id)}
                                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                        >
                                          <X className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Botão gerar link */}
                            <Button
                              onClick={handleGenerateLink}
                              disabled={selectedCourses.length === 0}
                              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 disabled:opacity-50"
                            >
                              <Link2 className="w-4 h-4 mr-2" />
                              Gerar Link
                            </Button>

                            {/* Link gerado */}
                            {generatedLink && (
                              <div className="space-y-2">
                                <Label className="text-gray-700 dark:text-gray-300">
                                  Link Gerado
                                </Label>
                                <div className="flex gap-2">
                                  <Input
                                    type="text"
                                    value={generatedLink}
                                    readOnly
                                    className="flex-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                                  />
                                  <Button
                                    onClick={handleCopyLink}
                                    className={`px-4 ${
                                      linkCopied
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                  >
                                    {linkCopied ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <Copy className="w-4 h-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Informações */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
                                <Info className="w-4 h-4 mr-2" />
                                Como funciona
                              </h4>
                              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">1.</span>
                                  <span>Selecione os cursos que deseja incluir no link</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">2.</span>
                                  <span>Clique em &quot;Gerar Link&quot; para criar o URL</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">3.</span>
                                  <span>Copie e use o link na sua landing page</span>
                                </li>
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">4.</span>
                                  <span>Usuários serão redirecionados ao carrinho com os cursos já adicionados</span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="seguranca">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-gray-900 dark:text-white">Alterar Senha</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                              Mantenha sua conta segura alterando sua senha regularmente
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Coluna da esquerda - Formulário */}
                          <div className="space-y-4">
                            {/* Senha Atual */}
                            <div className="space-y-2">
                              <Label htmlFor="currentPassword" className="text-gray-700 dark:text-gray-300">
                                Senha Atual
                              </Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                <Input
                                  id="currentPassword"
                                  type="password"
                                  value={passwordData.currentPassword}
                                  onChange={(e) =>
                                    setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))
                                  }
                                  placeholder="Digite sua senha atual"
                                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                              </div>
                            </div>

                            {/* Nova Senha */}
                            <div className="space-y-2">
                              <Label htmlFor="newPassword" className="text-gray-700 dark:text-gray-300">
                                Nova Senha
                              </Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                <Input
                                  id="newPassword"
                                  type="password"
                                  value={passwordData.newPassword}
                                  onChange={(e) =>
                                    setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))
                                  }
                                  placeholder="Digite sua nova senha"
                                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                              </div>
                              {/* Indicador de força da senha */}
                              {passwordData.newPassword && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                    <div
                                      className={`h-2 rounded-full transition-all duration-300 ${
                                        passwordData.newPassword.length >= 6
                                          ? 'bg-green-500 w-full'
                                          : passwordData.newPassword.length >= 3
                                            ? 'bg-yellow-500 w-2/3'
                                            : 'bg-red-500 w-1/3'
                                      }`}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-fit">
                                    {passwordData.newPassword.length >= 6
                                      ? 'Forte'
                                      : passwordData.newPassword.length >= 3
                                        ? 'Média'
                                        : 'Fraca'}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Confirmar Senha */}
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword" className="text-gray-700 dark:text-gray-300">
                                Confirmar Nova Senha
                              </Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                <Input
                                  id="confirmPassword"
                                  type="password"
                                  value={passwordData.confirmPassword}
                                  onChange={(e) =>
                                    setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                  }
                                  placeholder="Confirme sua nova senha"
                                  className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                              </div>
                              {/* Validação de confirmação */}
                              {passwordData.confirmPassword && (
                                <div className="flex items-center space-x-2 mt-2">
                                  {passwordData.newPassword === passwordData.confirmPassword ? (
                                    <div className="flex items-center text-green-600 dark:text-green-400">
                                      <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mr-2"></div>
                                      <span className="text-xs">Senhas coincidem</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center text-red-600 dark:text-red-400">
                                      <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full mr-2"></div>
                                      <span className="text-xs">Senhas não coincidem</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Botão de Alterar */}
                            <div className="pt-2">
                              <Button
                                onClick={handleChangePassword}
                                disabled={
                                  isChangingPassword ||
                                  !passwordData.currentPassword ||
                                  !passwordData.newPassword ||
                                  !passwordData.confirmPassword ||
                                  passwordData.newPassword !== passwordData.confirmPassword ||
                                  passwordData.newPassword.length < 6
                                }
                                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
                              >
                                {isChangingPassword ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    Alterando...
                                  </>
                                ) : (
                                  <>
                                    <Lock className="w-4 h-4 mr-2" />
                                    Alterar Senha
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Coluna da direita - Dicas de Segurança */}
                          <div className="space-y-4">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                                <div className="w-4 h-4 bg-blue-600 dark:bg-blue-400 rounded-full mr-2"></div>
                                Dicas de Segurança
                              </h4>
                              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  Use pelo menos 6 caracteres
                                </li>
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  Combine letras, números e símbolos
                                </li>
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  Evite informações pessoais
                                </li>
                                <li className="flex items-start">
                                  <span className="text-blue-500 mr-2">•</span>
                                  Não reutilize senhas de outras contas
                                </li>
                              </ul>
                            </div>

                            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                                Recomendamos alterar regularmente.
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                Alterar sua senha regularmente ajuda a proteger sua conta contra acessos não
                                autorizados.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="administradores">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                              <User2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                              <CardTitle className="text-gray-900 dark:text-white">Administradores</CardTitle>
                              <CardDescription className="text-gray-600 dark:text-gray-300 font-normal">
                                Gerencie os administradores do sistema
                              </CardDescription>
                            </div>
                          </div>
                          <Dialog open={showAddAdminDialog} onOpenChange={setShowAddAdminDialog}>
                            <DialogTrigger asChild>
                              <Button className="bg-blue-600 hover:bg-blue-700">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Adicionar Admin
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                              <DialogHeader>
                                <DialogTitle className="text-gray-900 dark:text-white">
                                  Cadastrar Novo Administrador
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="adminName" className="text-gray-700 dark:text-gray-300">
                                    Nome Completo
                                  </Label>
                                  <div className="relative">
                                    <User2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                    <Input
                                      id="adminName"
                                      placeholder="Digite o nome completo"
                                      value={newAdminData.name}
                                      onChange={(e) => setNewAdminData((prev) => ({ ...prev, name: e.target.value }))}
                                      className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="adminEmail" className="text-gray-700 dark:text-gray-300">
                                    Email
                                  </Label>
                                  <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                    <Input
                                      id="adminEmail"
                                      type="email"
                                      placeholder="Digite o email"
                                      value={newAdminData.email}
                                      onChange={(e) => setNewAdminData((prev) => ({ ...prev, email: e.target.value }))}
                                      className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="adminPassword" className="text-gray-700 dark:text-gray-300">
                                    Senha (mínimo 6 caracteres)
                                  </Label>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                    <Input
                                      id="adminPassword"
                                      type="password"
                                      placeholder="Digite a senha"
                                      value={newAdminData.password}
                                      onChange={(e) =>
                                        setNewAdminData((prev) => ({ ...prev, password: e.target.value }))
                                      }
                                      className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="adminConfirmPassword" className="text-gray-700 dark:text-gray-300">
                                    Confirmar Senha
                                  </Label>
                                  <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                                    <Input
                                      id="adminConfirmPassword"
                                      type="password"
                                      placeholder="Confirme a senha"
                                      value={newAdminData.confirmPassword}
                                      onChange={(e) =>
                                        setNewAdminData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                                      }
                                      className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                  </div>
                                </div>
                                {newAdminData.confirmPassword && newAdminData.password && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    {newAdminData.password === newAdminData.confirmPassword ? (
                                      <div className="flex items-center text-green-600 dark:text-green-400">
                                        <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full mr-2"></div>
                                        <span className="text-xs">Senhas coincidem</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center text-red-600 dark:text-red-400">
                                        <div className="w-2 h-2 bg-red-600 dark:bg-red-400 rounded-full mr-2"></div>
                                        <span className="text-xs">Senhas não coincidem</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                <div className="flex justify-end space-x-2 pt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => setShowAddAdminDialog(false)}
                                    disabled={isCreatingAdmin}
                                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    onClick={handleCreateAdmin}
                                    disabled={
                                      isCreatingAdmin ||
                                      !newAdminData.name ||
                                      !newAdminData.email ||
                                      !newAdminData.password ||
                                      !newAdminData.confirmPassword ||
                                      newAdminData.password !== newAdminData.confirmPassword ||
                                      newAdminData.password.length < 6
                                    }
                                    className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {isCreatingAdmin ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Criando...
                                      </>
                                    ) : (
                                      <>
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Criar Admin
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {loadingAdmins ? (
                          <div className="flex items-center justify-center py-8">
                            <LoadingSpinner className="w-6 h-6 mr-2" />
                            <span>Carregando administradores...</span>
                          </div>
                        ) : admins.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                            <BadgeInfo className="w-6 h-6 mb-2" />
                            <span>Nenhum outro administrador encontrado.</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {admins.map((admin) => (
                              <div
                                key={admin.id}
                                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={admin.profilePic || undefined} alt={admin.name} />
                                    <AvatarFallback className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                                      {admin.name
                                        .split(' ')
                                        .map((n) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="flex items-center space-x-2">
                                      <h4 className="font-medium text-gray-900 dark:text-white">{admin.name}</h4>
                                      {admin.id === user?.id && (
                                        <Badge variant="secondary" className="text-xs">
                                          Você
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{admin.email}</p>
                                    <p className="text-xs text-gray-400 dark:text-gray-500">
                                      Cadastrado em {formatDate(admin.createdAt)}
                                    </p>
                                  </div>
                                </div>
                                {admin.id !== user?.id && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRemoveAdmin(admin.id)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogContent className="sm:max-w-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="flex items-center text-red-600 dark:text-red-400">
                        <Trash2 className="w-5 h-5 mr-2" />
                        Confirmar Exclusão
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          Tem certeza que deseja remover o administrador{' '}
                          <span className="font-semibold">{adminToDelete?.name}</span>?
                        </p>
                        <p className="text-xs text-red-600 dark:text-red-300 mt-2">
                          Esta ação não pode ser desfeita. O administrador perderá acesso ao sistema imediatamente.
                        </p>
                      </div>

                      <div className="flex justify-end space-x-2 pt-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowDeleteDialog(false);
                            setAdminToDelete(null);
                          }}
                          className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={confirmDeleteAdmin}
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remover Admin
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </main>

          <Footer />
        </div>
      </div>
    </ProtectedRoute>
  );
}
