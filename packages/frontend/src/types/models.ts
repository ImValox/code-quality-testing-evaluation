export interface User {
  id: number;
  firstname: string;
  lastname: string;
  username: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface LoginCredentials {
  password?: string;
  username?: string;
}

export interface RegisterCredentials {
  firstname?: string;
  lastname?: string;
  password?: string;
  username?: string;
}

export interface Product {
  created_at?: string;
  id: number;
  name: string;
  price: number;
  stock: number;
  updated_at?: string | null;
}

export interface ProductFormData {
  name: string;
  price: number | string;
  stock: number | string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}
