// lib/api.ts
import axios from "axios";

import {
  Category,
  Recipe,
  User,
  UserRole,
  AdminUser,
  PagedResult,
} from "../types/api";
import {
  CreateCategoryDto,
  CreateRecipeDto,
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
} from "@/types/dto";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

// Auth endpoints
export const auth = {
  register: (data: RegisterDto) => api.post<User>("/user/register", data),
  login: (data: LoginDto) => api.post<User>("/user/login", data),
  logout: () => api.post("/user/logout"),
  me: () => api.get<User>("/user/me"),
};

// Recipe endpoints
export const recipes = {
  getAll: () => api.get<Recipe[]>("/recipe"),
  getById: (id: number) => api.get<Recipe>(`/recipe/${id}`),
  getFavoriteInfo: (id: number) =>
    api.get<{ count: number; isFavorited: boolean }>(`/recipe/${id}/favorite`),
  create: (data: CreateRecipeDto) => api.post<Recipe>("/recipe", data),
  update: (id: number, data: Partial<Recipe> | CreateRecipeDto) =>
    api.put<Recipe>(`/recipe/${id}`, data),
  delete: (id: number) => api.delete(`/recipe/${id}`),
  favorite: (id: number) => api.post<void>(`/recipe/${id}/favorite`),
  unfavorite: (id: number) => api.delete<void>(`/recipe/${id}/favorite`),
};

// Category endpoints
export const categories = {
  getAll: () => api.get<Category[]>("/category"),
  getById: (id: number) => api.get<Category>(`/category/${id}`),
  create: (data: CreateCategoryDto) => api.post<Category>("/category", data),
  update: (id: number, data: Partial<Category>) =>
    api.put<void>(`/category/${id}`, data),
  delete: (id: number) => api.delete<void>(`/category/${id}`),
};

// User endpoints
export const users = {
  getRecipes: (userId: number) => api.get<Recipe[]>(`/user/${userId}/recipes`),
  getFavorites: (userId: number) =>
    api.get<Recipe[]>(`/user/${userId}/favorites`),
  updateMe: (
    data: Partial<{
      firstName: string;
      lastName: string;
      displayName: string;
      email: string;
    }>
  ) => api.put(`/user/me`, data),
  changePassword: (data: ChangePasswordDto) =>
    api.post<{ message: string }>(`/user/me/password`, data),
  // Admin
  search: (q?: string, page = 1, pageSize = 20) =>
    api.get<PagedResult<AdminUser>>(`/user`, { params: { q, page, pageSize } }),
  updateRoles: (id: number, roles: UserRole[]) =>
    api.put<User>(`/user/${id}/roles`, { roles }),
  updatePermissions: (
    id: number,
    perms: Partial<{ canSubmitRecipes: boolean }>
  ) => api.put<User>(`/user/${id}/permissions`, perms),
  delete: (id: number) => api.delete<void>(`/user/${id}`),
};
