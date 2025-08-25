interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
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
  id?: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'STUDENT';
  createdAt: string;
}

interface DashboardStats {
  activeCourses: number;
  completedCourses: number;
  studyHours: number;
  certificates: number;
  totalProgress: number;
}

interface Course {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructor: string;
  category: string;
  price: number;
  pricePaid: number;
  purchaseDate: string;
  status: string;
  progress: {
    completedLessons: number;
    totalLessons: number;
    percentage: number;
  };
  rating: number;
  studentsCount: number;
}

interface CourseAvailable {
  id: number
  title: string
  description: string
  price: number
  thumbnailUrl: string
  createdAt: string
  updatedAt: string
  instructor: string
  category: string
  rating: number
  studentsCount: number
}


interface RecentActivity {
  type: string;
  courseId: number;
  lessonId?: number;
  lessonTitle?: string;
  certificateId?: number;
}

interface Module {
  id: number;
  title: string;
  order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: number;
  title: string;
  videoUrl: string;
  pdfUrl?: string;
  order: number;
  completed: boolean;
}

interface Comment {
  id: number;
  content: string;
  userId: number;
  lessonId: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  parent: Comment;
  replies: Comment[];
}

interface Progress {
  id: number;
  userId: number;
  courseId: number;
  completedLessons: number;
  totalLessons: number;
  updatedAt: string;
}

interface Certificate {
  id: number;
  url: string;
  issuedAt: string;
}

interface MyCourse {
  id: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructor: string;
  price: number;
  pricePaid: number;
  purchaseDate: string;
  status: string;
  category: string;
  progress: Progress;
  modules: Module[];
  certificate?: Certificate;
  rating: number;
  studentsCount: number;
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
  async createUser(createUser: CreateUserRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(createUser),
    });
  }

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

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile', {
      method: 'PUT',
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
    const endpoint = `/courses/my-courses${queryString ? `?${queryString}` : ''}`;

    return this.request(endpoint);
  }

  // Available Courses (Student)
  async getAvailableCourses(params?: {
    search?: string;
    category?: string;
    priceRange?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ courses: CourseAvailable[]; total: number; page: number; totalPages: number }>> {
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
      stats: DashboardStats;
      courses: Course[];
      recentActivity: RecentActivity[];
    }>
  > {
    return this.request('/dashboard/student');
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
  async getCertificates(): Promise<ApiResponse<any>> {
    return this.request('/certificates/user');
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

  async getCourseDetails(courseId: string): Promise<ApiResponse<MyCourse>> {
    return this.request<MyCourse>(`/courses/my-courses/${courseId}`);
  }

  async downloadCertificate(courseId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${this.baseURL}/certificates/download/${courseId}`, {
      method: 'POST',
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to download certificate: ${response.status}`,
      };
    }

    const blob = await response.blob();
    return {
      success: true,
      data: blob,
    };
  }

  async getLessonComments(lessonId: number): Promise<ApiResponse<Comment[]>> {
    return this.request<Comment[]>(`/comments/lesson/${lessonId}`);
  }

  async addLessonComment(lessonId: number, content: string, parentId?: number): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, lessonId, parentId }),
    });
  }

  async updateComment(commentId: number, content: string): Promise<ApiResponse<Comment>> {
    return this.request<Comment>(`/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  }

  async deleteComment(commentId: number): Promise<ApiResponse> {
    return this.request(`/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  async updateLessonProgress(courseId: number, lessonId: number, completed: boolean): Promise<ApiResponse> {
    return this.request(`/courses/my-courses/${courseId}/lessons/${lessonId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  }

  async generateCertificate(courseId: string): Promise<ApiResponse<Certificate>> {
    return this.request<Certificate>(`/courses/${courseId}/certificate`, {
      method: 'POST',
    });
  }
}

export const apiService = new ApiService();
export type {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  User,
  Course,
  Module,
  Lesson,
  Comment,
  Progress,
  Certificate,
  MyCourse,
  DashboardStats,
  RecentActivity,
  CourseAvailable
};
