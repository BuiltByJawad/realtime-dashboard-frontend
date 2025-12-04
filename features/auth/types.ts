export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  user: AuthUser;
}