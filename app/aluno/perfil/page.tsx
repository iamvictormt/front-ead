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
import { User, Mail, Award, Save, Edit, Download, Phone, MapPin, Briefcase, Calendar, Lock } from "lucide-react"
import clsx from "clsx"
import { useSidebar } from "@/contexts/sidebar-context"
import { apiService } from "@/lib/api"
import { useToast } from "@/contexts/toast-context"

export default function PerfilPage() {
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const [isEditing, setIsEditing] = useState(false)
  const { user, updateProfile, isLoading } = useAuth()
  const [certificates, setCertificates] = useState([])
  const [loadingCertificates, setLoadingCertificates] = useState(false)
  const [downloadingCertificate, setDownloadingCertificate] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const contentMargin = clsx("transition-all duration-300 ease-in-out flex flex-col min-h-screen", {
    "md:ml-42": isCollapsed,
    "md:ml-80": !isCollapsed,
  })

  const [profileData, setProfileData] = useState({
    nome: user?.name || "",
    email: user?.email || "",
    country: user?.country || "",
    city: user?.city || "",
    profession: user?.profession || "",
    phone: user?.phone || "",
    birthDate: user?.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "",
    profilePic: user?.profilePic || "",
  })

  useEffect(() => {
    if (user) {
      setProfileData({
        nome: user.name || "",
        email: user.email || "",
        country: user.country || "",
        city: user.city || "",
        profession: user.profession || "",
        phone: user.phone || "",
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split("T")[0] : "",
        profilePic: user.profilePic || "",
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
        showError("Não foi possível carregar os certificados")
      }
    } catch (error) {
      console.error("Error loading certificates:", error)
      showError("Erro ao carregar certificados")
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

        success("Certificado baixado com sucesso!")
      } else {
        showError("Não foi possível baixar o certificado")
      }
    } catch (error) {
      console.error("Error downloading certificate:", error)
      showError("Erro ao baixar certificado")
    } finally {
      setDownloadingCertificate(null)
    }
  }

  const handleSave = async () => {
    const result = await updateProfile({
      name: profileData.nome,
      country: profileData.country,
      city: profileData.city,
      profession: profileData.profession,
      phone: profileData.phone,
      birthDate: profileData.birthDate ? new Date(profileData.birthDate) : null,
    })

    if (result.success) {
      setIsEditing(false)
      success("Perfil atualizado com sucesso!")
    } else {
      console.error(result.error)
      showError("Não foi possível atualizar o perfil")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleProfilePicChange = (url: string) => {
    apiService.updateProfile({ profilePic: url }).then((result) => {
      if (result.success) {
        success("Imagem de perfil atualizada com sucesso!")
        setProfileData((prev) => ({
          ...prev,
          profilePic: url,
        }))
      } else {
        showError("Não foi possível atualizar a imagem de perfil")
      }
    })
  }

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("As senhas não coincidem")
      return
    }

    if (passwordData.newPassword.length < 6) {
      showError("A nova senha deve ter pelo menos 6 caracteres")
      return
    }

    setIsChangingPassword(true)
    try {
      const result = await apiService.changePassword(passwordData.currentPassword, passwordData.newPassword)

      if (result.success) {
        success("Senha alterada com sucesso!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } else {
        showError(result.error || "Não foi possível alterar a senha")
      }
    } catch (error) {
      console.error("Error changing password:", error)
      showError("Erro ao alterar senha")
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading || !user) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <CollapsibleSidebar onToggle={setIsCollapsed} />
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
        <CollapsibleSidebar onToggle={setIsCollapsed} />

        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="hidden md:inline md:px-6 top-0 md:top-4 sticky md:relative z-40 mb-6 md:mb-8">
            <div className="bg-[#121F3F] md:bg-white md:dark:bg-gray-800 md:rounded-lg shadow dark:shadow-gray-700/20 p-4 md:p-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-semibold text-white md:text-gray-900 md:dark:text-white ml-12 md:ml-0">
                  Meu Perfil
                </h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 mt-14 md:mt-0">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="mx-auto">
                <Tabs defaultValue="perfil" className="space-y-8">
                  <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger
                      value="perfil"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                    >
                      Informações Pessoais
                    </TabsTrigger>
                    <TabsTrigger
                      value="senha"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                    >
                      Alterar Senha
                    </TabsTrigger>
                    <TabsTrigger
                      value="conquistas"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                    >
                      Conquistas
                    </TabsTrigger>
                    <TabsTrigger
                      value="certificados"
                      className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-white"
                    >
                      Certificados
                    </TabsTrigger>
                  </TabsList>

                  {/* Perfil Tab */}
                  <TabsContent value="perfil" className="space-y-6">
                    {/* Profile Header */}
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardContent className="pt-6">
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                          <div className="relative group pb-2 pr-2 md:pb-0 md:pr-0">
                            <Avatar className="w-32 h-32 rounded-2xl">
                              <AvatarImage
                                src={profileData.profilePic || "/placeholder.svg?height=96&width=96"}
                                key={profileData.profilePic} // Força re-render quando URL muda
                              />
                              <AvatarFallback className="text-2xl">
                                {profileData.nome
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>

                            {/* Overlay para desktop (hover) */}
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex">
                              <label
                                htmlFor="profile-pic-upload"
                                className="cursor-pointer text-white text-xs text-center"
                              >
                                <User className="w-6 h-6 mx-auto mb-1" />
                                Alterar
                              </label>
                            </div>

                            {/* Botão visível para mobile */}
                            <div className="absolute bottom-0 right-0 md:hidden">
                              <label
                                htmlFor="profile-pic-upload"
                                className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-colors flex items-center justify-center"
                              >
                                <Edit className="w-4 h-4" />
                              </label>
                            </div>

                            <input
                              id="profile-pic-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  console.log("[v0] Iniciando upload da imagem:", file.name)
                                  const formData = new FormData()
                                  formData.append("file", file)
                                  try {
                                    const response = await fetch("/api/upload", {
                                      method: "POST",
                                      body: formData,
                                    })
                                    const data = await response.json()
                                    console.log("[v0] Resposta do upload:", data)
                                    if (data && data.url) {
                                      console.log("[v0] URL recebida:", data.url)
                                      handleProfilePicChange(data.url)
                                    }
                                  } catch (error) {
                                    console.error("[v0] Erro na requisição:", error)
                                    showError("Erro ao fazer upload da imagem")
                                  }
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{profileData.nome}</h2>
                            <p className="text-gray-600 dark:text-gray-300 mt-1">{profileData.email}</p>
                            {profileData.profession && (
                              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{profileData.profession}</p>
                            )}
                            <Badge className="mt-2">Aluno</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Personal Information */}
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="pr-2">
                            <CardTitle className="text-gray-900 dark:text-white">Informações Pessoais</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-300">
                              Gerencie suas informações pessoais e de contato
                            </CardDescription>
                          </div>
                          <Button
                            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
                            size="sm"
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
                                // onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={true}
                                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                              Telefone
                            </Label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                              <Input
                                id="phone"
                                type="tel"
                                value={profileData.phone}
                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                disabled={!isEditing}
                                placeholder="(11) 99999-9999"
                                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="birthDate" className="text-gray-700 dark:text-gray-300">
                              Data de Nascimento
                            </Label>
                            <div className="relative">
                              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                              <Input
                                id="birthDate"
                                type="date"
                                value={profileData.birthDate}
                                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                                disabled={!isEditing}
                                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">
                              País
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                              <Input
                                id="country"
                                value={profileData.country}
                                onChange={(e) => handleInputChange("country", e.target.value)}
                                disabled={!isEditing}
                                placeholder="Brasil"
                                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">
                              Cidade
                            </Label>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                              <Input
                                id="city"
                                value={profileData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                disabled={!isEditing}
                                placeholder="São Paulo"
                                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="profession" className="text-gray-700 dark:text-gray-300">
                              Profissão
                            </Label>
                            <div className="relative">
                              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                              <Input
                                id="profession"
                                value={profileData.profession}
                                onChange={(e) => handleInputChange("profession", e.target.value)}
                                disabled={!isEditing}
                                placeholder="Desenvolvedor, Designer, etc."
                                className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Alterar Senha Tab */}
                  <TabsContent value="senha" className="space-y-6">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm dark:shadow-gray-700/20 border-gray-200 dark:border-gray-700">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
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
                                  onChange={(e) => handlePasswordInputChange("currentPassword", e.target.value)}
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
                                  onChange={(e) => handlePasswordInputChange("newPassword", e.target.value)}
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
                                          ? "bg-green-500 w-full"
                                          : passwordData.newPassword.length >= 3
                                            ? "bg-yellow-500 w-2/3"
                                            : "bg-red-500 w-1/3"
                                      }`}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400 min-w-fit">
                                    {passwordData.newPassword.length >= 6
                                      ? "Forte"
                                      : passwordData.newPassword.length >= 3
                                        ? "Média"
                                        : "Fraca"}
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
                                  onChange={(e) => handlePasswordInputChange("confirmPassword", e.target.value)}
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
                                Alterar sua senha regularmente ajuda a proteger sua conta contra acessos não autorizados.
                              </p>
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
                          Suas Conquistas
                        </CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-300">
                          Acompanhe seu progresso e conquistas na plataforma
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {conquistas.map((conquista) => (
                            <div
                              key={conquista.id}
                              className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow-sm dark:shadow-gray-700/20"
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
