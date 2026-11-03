export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokenPayload {
  id: number;
  username: string;
}

export interface Product {
  created_at?: string;
  id: number;
  name: string;
  price: number;
  stock: number;
  updated_at?: null | string;
}

export interface ProductInput {
  name: string;
  price?: number;
  stock?: number;
}

export interface User {
  created_at?: string;
  firstname: string;
  id: number;
  lastname: string;
  password?: string;
  updated_at?: null | string;
  username: string;
}

export interface UserInput {
  firstname: string;
  lastname: string;
  password?: string;
  username: string;
}
