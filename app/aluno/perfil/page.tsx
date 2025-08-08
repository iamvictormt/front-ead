'use client';

import { CollapsibleSidebar } from '@/components/collapsible-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, MapPin, Calendar, Award, Settings, Camera, Save, Edit } from 'lucide-react';
import clsx from 'clsx';
import { useSidebar } from '@/contexts/sidebar-context';

export default function PerfilPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isCollapsed);
  const [isEditing, setIsEditing] = useState(false);
  const { user, updateProfile } = useAuth();

  const contentMargin = clsx('transition-all duration-300 ease-in-out flex flex-col min-h-screen', {
    'md:ml-42': isSidebarCollapsed,
    'md:ml-80': !isSidebarCollapsed,
  });

  // Mock data para perfil do usuário
  const [profileData, setProfileData] = useState({
    nome: user?.name || 'Maria Santos',
    email: user?.email || 'aluno@test.com',
    telefone: '(11) 99999-9999',
    cidade: 'São Paulo, SP',
    dataNascimento: '1995-03-15',
    bio: 'Desenvolvedora Frontend apaixonada por tecnologia e aprendizado contínuo.',
    linkedin: 'https://linkedin.com/in/mariasantos',
    github: 'https://github.com/mariasantos',
    website: 'https://mariasantos.dev',
  });

  const conquistas = [
    {
      id: 1,
      titulo: 'Primeiro Curso Concluído',
      descricao: 'Completou seu primeiro curso na plataforma',
      data: '2024-01-10',
      icone: '🎓',
    },
    {
      id: 2,
      titulo: 'Estudante Dedicado',
      descricao: 'Completou 20+ horas de estudo',
      data: '2024-01-25',
      icone: '📚',
    },
    {
      id: 3,
      titulo: 'Meta Semanal',
      descricao: 'Completou 5 lições em uma semana',
      data: '2024-02-01',
      icone: '🎯',
    },
  ];

  const certificados = [
    {
      id: 1,
      curso: 'JavaScript Avançado',
      instrutor: 'Maria Santos',
      dataEmissao: '2024-01-10',
      credencial: 'JS-ADV-2024-001',
    },
    {
      id: 2,
      curso: 'React Fundamentals',
      instrutor: 'João Silva',
      dataEmissao: '2024-02-15',
      credencial: 'REACT-FUND-2024-002',
    },
  ];

  const handleSave = async () => {
    const result = await updateProfile({
      name: profileData.nome,
      email: profileData.email,
    });

    if (result.success) {
      setIsEditing(false);
    } else {
      console.error(result.error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <ProtectedRoute allowedRoles={['STUDENT']}>
      <div className="min-h-screen bg-gray-50">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />

        <div className={contentMargin}>
          {/* Header */}
          <header className="md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#2D2D2D] md:bg-white md:rounded-lg shadow p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 ml-12 md:ml-0">
                  Meu Perfil
                </h1>
                <Button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  className={isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto">
                <Tabs defaultValue="perfil" className="md:space-y-8 space-y-20">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 space-y-2">
                    <TabsTrigger value="perfil">Informações Pessoais</TabsTrigger>
                    <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
                    <TabsTrigger value="certificados">Certificados</TabsTrigger>
                  </TabsList>

                  {/* Perfil Tab */}
                  <TabsContent value="perfil" className="space-y-6">
                    {/* Profile Header */}
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                          <div className="relative">
                            <Avatar className="w-24 h-24">
                              <AvatarImage src="/placeholder.svg?height=96&width=96" />
                              <AvatarFallback className="text-2xl">
                                {profileData.nome
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            {isEditing && (
                              <button className="absolute bottom-0 right-0 p-1 bg-blue-600 text-white rounded-full hover:bg-blue-700">
                                <Camera className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-900">{profileData.nome}</h2>
                            <p className="text-gray-600 mt-1">{profileData.email}</p>
                            <Badge className="mt-2">Aluno</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Informações Pessoais</CardTitle>
                        <CardDescription>Gerencie suas informações pessoais e de contato</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome">Nome Completo</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="nome"
                                value={profileData.nome}
                                onChange={(e) => handleInputChange('nome', e.target.value)}
                                disabled={!isEditing}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={!isEditing}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="telefone">Telefone</Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="telefone"
                                value={profileData.telefone}
                                onChange={(e) => handleInputChange('telefone', e.target.value)}
                                disabled={!isEditing}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cidade">Cidade</Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="cidade"
                                value={profileData.cidade}
                                onChange={(e) => handleInputChange('cidade', e.target.value)}
                                disabled={!isEditing}
                                className="pl-10"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                              <Input
                                id="dataNascimento"
                                type="date"
                                value={profileData.dataNascimento}
                                onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                                disabled={!isEditing}
                                className="pl-10"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="bio">Biografia</Label>
                          <textarea
                            id="bio"
                            value={profileData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            disabled={!isEditing}
                            className="w-full p-3 border border-gray-300 rounded-md resize-none h-24 disabled:bg-gray-50"
                            placeholder="Conte um pouco sobre você..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="linkedin">LinkedIn</Label>
                            <Input
                              id="linkedin"
                              value={profileData.linkedin}
                              onChange={(e) => handleInputChange('linkedin', e.target.value)}
                              disabled={!isEditing}
                              placeholder="https://linkedin.com/in/..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="github">GitHub</Label>
                            <Input
                              id="github"
                              value={profileData.github}
                              onChange={(e) => handleInputChange('github', e.target.value)}
                              disabled={!isEditing}
                              placeholder="https://github.com/..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              value={profileData.website}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                              disabled={!isEditing}
                              placeholder="https://seusite.com"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Conquistas Tab */}
                  <TabsContent value="conquistas" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Award className="w-5 h-5 mr-2" />
                          Suas Conquistas
                        </CardTitle>
                        <CardDescription>Acompanhe seu progresso e conquistas na plataforma</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {conquistas.map((conquista) => (
                            <div key={conquista.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                              <div className="text-2xl">{conquista.icone}</div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{conquista.titulo}</h3>
                                <p className="text-sm text-gray-600 mt-1">{conquista.descricao}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  Conquistado em {new Date(conquista.data).toLocaleDateString('pt-BR')}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Certificados Tab */}
                  <TabsContent value="certificados" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Award className="w-5 h-5 mr-2" />
                          Meus Certificados
                        </CardTitle>
                        <CardDescription>Certificados dos cursos que você concluiu</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {certificados.map((certificado) => (
                            <div
                              key={certificado.id}
                              className="block md:flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                            >
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{certificado.curso}</h3>
                                <p className="text-sm text-gray-600">Instrutor: {certificado.instrutor}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Emitido em {new Date(certificado.dataEmissao).toLocaleDateString('pt-BR')}
                                </p>
                                <p className="text-xs text-gray-500">Credencial: {certificado.credencial}</p>
                              </div>
                              <div className="flex space-x-2 md:mt-0 mt-3">
                                <Button size="sm" variant="outline">
                                  Visualizar
                                </Button>
                                <Button size="sm" variant="outline">
                                  Download
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {certificados.length === 0 && (
                          <div className="text-center py-8">
                            <Award className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500">Você ainda não possui certificados</p>
                            <p className="text-sm text-gray-400">Complete cursos para ganhar certificados</p>
                          </div>
                        )}
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
