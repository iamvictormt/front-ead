interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  user: {
    name: string;
    email: string;
    role: 'ADMIN' | 'STUDENT';
    createdAt: string;
  };
}

interface User {
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  createdAt: string;
}

interface Course {
  id: string;
  titulo: string;
  descricao: string;
  instrutor: string;
  preco: number;
  precoOriginal?: number;
  rating: number;
  totalAvaliacoes: number;
  alunos: number;
  duracao: string;
  categoria: string;
  nivel: string;
  status: string;
  promocao: boolean;
  bestseller: boolean;
  thumbnail?: string;
  createdAt: string;
  updatedAt: string;
}

interface MyCourse extends Course {
  progresso: number;
  duracaoAssistida: string;
  ultimaAula?: string;
  proximaAula?: string;
  certificado: boolean;
  dataInicio: string;
  dataConclusao?: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

    // Recuperar token do localStorage se disponível
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.message || `HTTP error! status: ${response.status}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/users', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Courses (Admin)
  async getCourses(params?: {
    search?: string;
    category?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ courses: Course[]; total: number; page: number; totalPages: number }>> {
    const searchParams = new URLSearchParams();

    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/courses${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async createCourse(courseData: Partial<Course>): Promise<ApiResponse<Course>> {
    return this.request<Course>('/courses', {
      method: 'POST',
      body: JSON.stringify(courseData),
    });
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<ApiResponse<Course>> {
    return this.request<Course>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(courseData),
    });
  }

  async deleteCourse(id: string): Promise<ApiResponse> {
    return this.request(`/courses/${id}`, {
      method: 'DELETE',
    });
  }

  // My Courses (Student)
  async getMyCourses(params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ courses: MyCourse[]; total: number; page: number; totalPages: number }>> {
    const searchParams = new URLSearchParams();

    if (params?.search) searchParams.append('search', params.search);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/student/courses${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  // Available Courses (Student)
  async getAvailableCourses(params?: {
    search?: string;
    category?: string;
    priceRange?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ courses: Course[]; total: number; page: number; totalPages: number }>> {
    const searchParams = new URLSearchParams();

    if (params?.search) searchParams.append('search', params.search);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.priceRange) searchParams.append('priceRange', params.priceRange);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const endpoint = `/courses/available${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  async purchaseCourse(courseId: string): Promise<ApiResponse> {
    return this.request(`/courses/${courseId}/purchase`, {
      method: 'POST',
    });
  }

  // Dashboard Stats
  async getAdminStats(): Promise<
    ApiResponse<{
      totalStudents: number;
      totalCourses: number;
      activeCourses: number;
      monthlyRevenue: number;
      completionRate: number;
    }>
  > {
    return this.request('/admin/stats');
  }

  async getStudentStats(): Promise<
    ApiResponse<{
      enrolledCourses: number;
      completedCourses: number;
      studyHours: number;
      certificates: number;
    }>
  > {
    return this.request('/student/stats');
  }

  // Achievements
  async getAchievements(): Promise<
    ApiResponse<
      Array<{
        id: string;
        titulo: string;
        descricao: string;
        data: string;
        icone: string;
      }>
    >
  > {
    return this.request('/student/achievements');
  }

  // Certificates
  async getCertificates(): Promise<
    ApiResponse<
      Array<{
        id: string;
        curso: string;
        instrutor: string;
        dataEmissao: string;
        credencial: string;
      }>
    >
  > {
    return this.request('/student/certificates');
  }

  // Settings
  async getSettings(): Promise<ApiResponse<Record<string, any>>> {
    return this.request('/settings');
  }

  async updateSettings(settings: Record<string, any>): Promise<ApiResponse> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const apiService = new ApiService();
export type { ApiResponse, LoginRequest, LoginResponse, User, Course, MyCourse };
