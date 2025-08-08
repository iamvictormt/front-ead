import { useState, useEffect } from 'react'
import { apiService, type ApiResponse } from '@/lib/api'

interface UseApiOptions {
  immediate?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const execute = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiCall()
      
      if (response.success && response.data) {
        setData(response.data)
        options.onSuccess?.(response.data)
      } else {
        const errorMessage = response.error || 'Erro desconhecido'
        setError(errorMessage)
        options.onError?.(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão'
      setError(errorMessage)
      options.onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (options.immediate !== false) {
      execute()
    }
  }, [])

  return {
    data,
    loading,
    error,
    execute,
    refetch: execute
  }
}

// Hook específico para paginação
export function usePaginatedApi<T>(
  apiCall: (params: any) => Promise<ApiResponse<{ data: T[]; total: number; page: number; totalPages: number }>>,
  initialParams: any = {}
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 0
  })
  const [params, setParams] = useState(initialParams)

  const execute = async (newParams?: any) => {
    setLoading(true)
    setError(null)

    const finalParams = { ...params, ...newParams }

    try {
      const response = await apiCall(finalParams)
      
      if (response.success && response.data) {
        setData(response.data.data || [])
        setPagination({
          page: response.data.page || 1,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0
        })
      } else {
        const errorMessage = response.error || 'Erro desconhecido'
        setError(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro de conexão'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateParams = (newParams: any) => {
    setParams(prev => ({ ...prev, ...newParams }))
    execute({ ...params, ...newParams, page: 1 }) // Reset to first page
  }

  const goToPage = (page: number) => {
    execute({ ...params, page })
  }

  useEffect(() => {
    execute()
  }, [])

  return {
    data,
    loading,
    error,
    pagination,
    params,
    execute,
    updateParams,
    goToPage,
    refetch: () => execute(params)
  }
}
