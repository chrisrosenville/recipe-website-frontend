export interface User {
  id: number;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  createdAt: string;
  canSubmitRecipes: boolean;
  roles: UserRole[];
}

export interface AdminUser extends User {
  recipesCount: number;
  favoritesReceived: number;
}

export type PagedResult<T> = {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
};

export enum UserRole {
  Admin = "admin",
  Author = "author",
  User = "user",
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Recipe {
  id: number;
  userId: number;
  name: string;
  description: string;
  currentStatus: RecipeStatus;
  categoryId: number;
  category: Category;
  user: User;
  ingredients: string[];
  instructions: string[];
  image: string;
  tags: string[];
  cookingTimeHours: number;
  cookingTimeMinutes: number;
  favoritesCount: number;
  createdAt: string;
  updatedAt: string;
}

export enum RecipeStatus {
  Draft = "Draft",
  Pending = "Pending",
  Approved = "Approved",
  Rejected = "Rejected",
}
