"use client"

import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { ProtectedRoute } from "@/components/protected-route"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Shield, Palette, Globe, Save } from 'lucide-react'

export default function ConfiguracoesAdminPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const { user } = useAuth()

  const contentMargin = `md:${isSidebarCollapsed ? "ml-22" : "ml-72"}`

  const [configuracoes, setConfiguracoes] = useState({
    // Notificações
    emailNotificacoes: true,
    pushNotificacoes: false,
    notificacoesCursos: true,
    notificacoesAlunos: true,
    
    // Segurança
    autenticacaoDoisFatores: false,
    loginAutomatico: true,
    
    // Aparência
    tema: "claro",
    idioma: "pt-BR",
    
    // Sistema
    backupAutomatico: true,
    logDetalhado: false
  })

  const handleConfigChange = (key: string, value: boolean | string) => {
    setConfiguracoes(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    // Aqui você salvaria as configurações no backend
    console.log("Configurações salvas:", configuracoes)
    // Mostrar toast de sucesso
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <div className="min-h-screen bg-gray-50">
        <CollapsibleSidebar onToggle={setIsSidebarCollapsed} />
        
        <div className={`${contentMargin} transition-all duration-300 ease-in-out flex flex-col min-h-screen`}>
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="px-4 md:px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-900 ml-12 md:ml-0">Configurações</h1>
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            <div className="px-4 md:px-6 py-4 md:py-6">
              <div className="max-w-4xl mx-auto">
                <Tabs defaultValue="notificacoes" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
                    <TabsTrigger value="seguranca">Segurança</TabsTrigger>
                    <TabsTrigger value="aparencia">Aparência</TabsTrigger>
                    <TabsTrigger value="sistema">Sistema</TabsTrigger>
                  </TabsList>

                  {/* Notificações Tab */}
                  <TabsContent value="notificacoes">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Bell className="w-5 h-5 mr-2" />
                          Notificações
                        </CardTitle>
                        <CardDescription>
                          Configure como você deseja receber notificações
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Notificações por Email</Label>
                            <p className="text-sm text-gray-500">Receba notificações importantes por email</p>
                          </div>
                          <Switch
                            checked={configuracoes.emailNotificacoes}
                            onCheckedChange={(checked) => handleConfigChange('emailNotificacoes', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Notificações Push</Label>
                            <p className="text-sm text-gray-500">Receba notificações push no navegador</p>
                          </div>
                          <Switch
                            checked={configuracoes.pushNotificacoes}
                            onCheckedChange={(checked) => handleConfigChange('pushNotificacoes', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Notificações de Cursos</Label>
                            <p className="text-sm text-gray-500">Novos cursos, atualizações e lembretes</p>
                          </div>
                          <Switch
                            checked={configuracoes.notificacoesCursos}
                            onCheckedChange={(checked) => handleConfigChange('notificacoesCursos', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Notificações de Alunos</Label>
                            <p className="text-sm text-gray-500">Novos alunos, conclusões e atividades</p>
                          </div>
                          <Switch
                            checked={configuracoes.notificacoesAlunos}
                            onCheckedChange={(checked) => handleConfigChange('notificacoesAlunos', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Segurança Tab */}
                  <TabsContent value="seguranca">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Shield className="w-5 h-5 mr-2" />
                          Segurança
                        </CardTitle>
                        <CardDescription>
                          Gerencie suas configurações de segurança
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Autenticação de Dois Fatores</Label>
                            <p className="text-sm text-gray-500">Adicione uma camada extra de segurança</p>
                          </div>
                          <Switch
                            checked={configuracoes.autenticacaoDoisFatores}
                            onCheckedChange={(checked) => handleConfigChange('autenticacaoDoisFatores', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Login Automático</Label>
                            <p className="text-sm text-gray-500">Manter-se conectado automaticamente</p>
                          </div>
                          <Switch
                            checked={configuracoes.loginAutomatico}
                            onCheckedChange={(checked) => handleConfigChange('loginAutomatico', checked)}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Alterar Senha</Label>
                          <div className="space-y-3">
                            <Input type="password" placeholder="Senha atual" />
                            <Input type="password" placeholder="Nova senha" />
                            <Input type="password" placeholder="Confirmar nova senha" />
                            <Button variant="outline">Alterar Senha</Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Aparência Tab */}
                  <TabsContent value="aparencia">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Palette className="w-5 h-5 mr-2" />
                          Aparência
                        </CardTitle>
                        <CardDescription>
                          Personalize a aparência da plataforma
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-3">
                          <Label>Tema</Label>
                          <Select
                            value={configuracoes.tema}
                            onValueChange={(value) => handleConfigChange('tema', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="claro">Claro</SelectItem>
                              <SelectItem value="escuro">Escuro</SelectItem>
                              <SelectItem value="automatico">Automático</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-3">
                          <Label>Idioma</Label>
                          <Select
                            value={configuracoes.idioma}
                            onValueChange={(value) => handleConfigChange('idioma', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                              <SelectItem value="en-US">English (US)</SelectItem>
                              <SelectItem value="es-ES">Español</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Sistema Tab */}
                  <TabsContent value="sistema">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Settings className="w-5 h-5 mr-2" />
                          Sistema
                        </CardTitle>
                        <CardDescription>
                          Configurações avançadas do sistema
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Backup Automático</Label>
                            <p className="text-sm text-gray-500">Fazer backup automático dos dados</p>
                          </div>
                          <Switch
                            checked={configuracoes.backupAutomatico}
                            onCheckedChange={(checked) => handleConfigChange('backupAutomatico', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label>Log Detalhado</Label>
                            <p className="text-sm text-gray-500">Registrar logs detalhados do sistema</p>
                          </div>
                          <Switch
                            checked={configuracoes.logDetalhado}
                            onCheckedChange={(checked) => handleConfigChange('logDetalhado', checked)}
                          />
                        </div>

                        <div className="space-y-3">
                          <Label>Ações do Sistema</Label>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button variant="outline">Exportar Dados</Button>
                            <Button variant="outline">Limpar Cache</Button>
                            <Button variant="outline" className="text-red-600 hover:text-red-700">
                              Reset Configurações
                            </Button>
                          </div>
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
  )
}
