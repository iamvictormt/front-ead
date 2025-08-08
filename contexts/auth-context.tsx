"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiService, type User, type LoginRequest } from '@/lib/api'

interface AuthContextType {
  user: User | null
  accessToken: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  isLoading: boolean
  isAuthenticated: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Verificar se há token salvo no localStorage ao inicializar
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('access_token')
      const savedUser = localStorage.getItem('user')
      
      if (savedToken && savedUser) {
        try {
          setAccessToken(savedToken)
          apiService.setToken(savedToken)
          
          // Verificar se o token ainda é válido fazendo uma requisição para o perfil
          const profileResponse = await apiService.getProfile()
          
          if (profileResponse.success && profileResponse.data) {
            setUser(profileResponse.data)
            // Atualizar dados salvos localmente
            localStorage.setItem('user', JSON.stringify(profileResponse.data))
          } else {
            // Token inválido, limpar dados
            handleLogout()
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
          handleLogout()
        }
      }
      
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true)
    
    try {
      const credentials: LoginRequest = { email, password }
      const response = await apiService.login(credentials)
      
      if (response.success && response.data) {
        const { access_token, user: userData } = response.data
        
        // Salvar no localStorage
        localStorage.setItem('access_token', access_token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Configurar token no serviço de API
        apiService.setToken(access_token)
        
        // Atualizar estado
        setAccessToken(access_token)
        setUser(userData)
        
        setIsLoading(false)
        return { success: true }
      } else {
        setIsLoading(false)
        return { 
          success: false, 
          error: response.error || 'Erro ao fazer login. Verifique suas credenciais.' 
        }
      }
    } catch (error) {
      setIsLoading(false)
      return { 
        success: false, 
        error: 'Erro de conexão. Tente novamente.' 
      }
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    apiService.clearToken()
    setAccessToken(null)
    setUser(null)
  }

  const logout = async () => {
    try {
      // Tentar fazer logout no servidor
      await apiService.logout()
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      handleLogout()
      router.push('/login')
    }
  }

  const refreshProfile = async () => {
    if (!accessToken) return

    try {
      const response = await apiService.getProfile()
      if (response.success && response.data) {
        setUser(response.data)
        localStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (error) {
      console.error('Error refreshing profile:', error)
    }
  }

  const value = {
    user,
    accessToken,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user && !!accessToken,
    refreshProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
