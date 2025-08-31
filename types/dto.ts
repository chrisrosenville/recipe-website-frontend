// --- User Registration ---
export interface RegisterDto {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  password: string;
}

// --- User Login ---
export interface LoginDto {
  email: string;
  password: string;
}

// --- Change Password ---
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// --- Create Recipe ---
export interface CreateRecipeDto {
  name: string;
  description: string;
  categoryId: number;
  ingredients: string[];
  instructions: string[];
  image: string;
  tags: string[];
  cookingTimeHours: number;
  cookingTimeMinutes: number;
}

// --- Create Category ---
export interface CreateCategoryDto {
  name: string;
  description?: string;
}
