"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Award, Camera, Save, Edit, Download } from "lucide-react"
import clsx from "clsx"
import { useSidebar } from "@/contexts/sidebar-context"
import { apiService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function PerfilPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(isCollapsed)
  const [isEditing, setIsEditing] = useState(false)
  const { user, updateProfile, isLoading } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [loadingCertificates, setLoadingCertificates] = useState(false)
  const [downloadingCertificate, setDownloadingCertificate] = useState<string | null>(null)
  const { toast } = useToast()

  const contentMargin = clsx("transition-all duration-300 ease-in-out flex flex-col min-h-screen", {
    "md:ml-42": isSidebarCollapsed,
    "md:ml-80": !isSidebarCollapsed,
  })

  const [profileData, setProfileData] = useState({
    nome: user?.name || "",
    email: user?.email || "",
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        nome: user.name || "",
        email: user.email || "",
      })
    }
  }, [user])

  const conquistas = [
    {
      id: 1,
      titulo: "Primeiro Curso Concluído",
      descricao: "Completou seu primeiro curso na plataforma",
      data: "2024-01-10",
      icone: "🎓",
    },
    {
      id: 2,
      titulo: "Estudante Dedicado",
      descricao: "Completou 20+ horas de estudo",
      data: "2024-01-25",
      icone: "📚",
    },
    {
      id: 3,
      titulo: "Meta Semanal",
      descricao: "Completou 5 lições em uma semana",
      data: "2024-02-01",
      icone: "🎯",
    },
  ]

  useEffect(() => {
    if (user) {
      loadCertificates()
    }
  }, [user])

  const loadCertificates = async () => {
    setLoadingCertificates(true)
    try {
      const response = await apiService.getCertificates()
      if (response.success && response.data) {
        setCertificates(response.data)
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os certificados",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading certificates:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar certificados",
        variant: "destructive",
      })
    } finally {
      setLoadingCertificates(false)
    }
  }

  const handleDownloadCertificate = async (courseId: string, courseName: string) => {
    setDownloadingCertificate(courseId)
    try {
      const response = await apiService.downloadCertificate(courseId)
      if (response.success && response.data) {
        const url = window.URL.createObjectURL(response.data)
        const link = document.createElement("a")
        link.href = url
        link.download = `certificado-${courseName.replace(/\s+/g, "-").toLowerCase()}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)

        toast({
          title: "Sucesso",
          description: "Certificado baixado com sucesso!",
        })
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível baixar o certificado",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error downloading certificate:", error)
      toast({
        title: "Erro",
        description: "Erro ao baixar certificado",
        variant: "destructive",
      })
    } finally {
      setDownloadingCertificate(null)
    }
  }

  const handleSave = async () => {
    const result = await updateProfile({
      name: profileData.nome,
      email: profileData.email,
    })

    if (result.success) {
      setIsEditing(false)
    } else {
      console.error(result.error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading || !user) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />
          <div className={contentMargin}>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-gray-300 dark:border-gray-600 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-300">Carregando perfil do usuário...</p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />

        <div className={contentMargin}>
          {/* Header */}
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#121F3F] md:bg-white md:dark:bg-gray-800 md:rounded-lg shadow dark:shadow-gray-700/20 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 md:dark:text-white ml-12 md:ml-0">
                  Meu Perfil
                </h1>
                <Button
                  onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                  className={
                    isEditing
                      ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
                      : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
                  }
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
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                          <div className="relative">
                            <Avatar className="w-24 h-24">
                              <AvatarImage src="/placeholder.svg?height=96&width=96" />
                              <AvatarFallback className="text-2xl">
                                {profileData.nome
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            {isEditing && (
                              <button className="absolute bottom-0 right-0 p-1 bg-blue-600 dark:bg-blue-600 text-white rounded-full hover:bg-blue-700 dark:hover:bg-blue-700">
                                <Camera className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.nome}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{profileData.email}</p>
                            <Badge className="mt-2">Aluno</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Informações Pessoais</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Gerencie suas informações pessoais e de contato
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="nome" className="text-gray-700 dark:text-gray-300">
                              Nome Completo
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                              <Input
                                id="nome"
                                value={profileData.nome}
                                onChange={(e) => handleInputChange("nome", e.target.value)}
                                disabled={!isEditing}
                                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                              Email
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                              <Input
                                id="email"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                disabled={!isEditing}
                                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Conquistas Tab */}
                  <TabsContent value="conquistas" className="space-y-6">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-white">
                          <Award className="w-5 h-5 mr-2" />
                          Suas Conquistas
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Acompanhe seu progresso e conquistas na plataforma
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {conquistas.map((conquista) => (
                            <div
                              key={conquista.id}
                              className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <div className="text-2xl">{conquista.icone}</div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-white">{conquista.titulo}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{conquista.descricao}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                  Conquistado em {new Date(conquista.data).toLocaleDateString("pt-BR")}
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
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <CardTitle className="flex items-center text-gray-900 dark:text-white">
                          Meus Certificados
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Certificados dos cursos que você concluiu
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {loadingCertificates ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
                            <span className="ml-2 text-gray-600 dark:text-gray-300">Carregando certificados...</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {certificates.map((certificate: any) => (
                              <div
                                key={certificate.id}
                                className="block md:flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700/20"
                              >
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {certificate.course.title}
                                  </h3>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Instrutor: {certificate.course.instructor}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Emitido em {new Date(certificate.issuedAt).toLocaleDateString("pt-BR")}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Credencial: {certificate.token}
                                  </p>
                                </div>
                                <div className="flex space-x-2 md:mt-0 mt-3">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleDownloadCertificate(certificate.course.id, certificate.course.title)
                                    }
                                    disabled={downloadingCertificate === certificate.course.id}
                                    className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                  >
                                    {downloadingCertificate === certificate.course.id ? (
                                      <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin mr-1"></div>
                                    ) : (
                                      <Download className="w-4 h-4 mr-1" />
                                    )}
                                    Download
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {!loadingCertificates && certificates.length === 0 && (
                          <div className="text-center py-8">
                            <Award className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">Você ainda não possui certificados</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500">
                              Complete cursos para ganhar certificados
                            </p>
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
  )
}
