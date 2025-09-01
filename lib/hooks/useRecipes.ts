import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recipes as recipesApi, users as usersApi } from "@/lib/api";
import type { Recipe } from "@/types/api";
import type { CreateRecipeDto } from "@/types/dto";

// Query keys for consistent caching
export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (filters: { page: number; pageSize: number }) =>
    [...recipeKeys.lists(), filters] as const,
  details: () => [...recipeKeys.all, "detail"] as const,
  detail: (id: number) => [...recipeKeys.details(), id] as const,
  favorites: (userId: number) =>
    [...recipeKeys.all, "favorites", userId] as const,
  userRecipes: (userId: number, page: number, pageSize: number) =>
    [...recipeKeys.all, "user", userId, page, pageSize] as const,
};

// Hook to fetch paginated recipes
export function useRecipes(page: number = 1, pageSize: number = 12) {
  return useQuery({
    queryKey: recipeKeys.list({ page, pageSize }),
    queryFn: async () => {
      const response = await recipesApi.getAll(page, pageSize);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to fetch a single recipe by ID
export function useRecipe(id: number) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: async () => {
      const response = await recipesApi.getById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual recipes
  });
}

// Hook to fetch user's favorite recipes
export function useUserFavorites(userId: number) {
  return useQuery({
    queryKey: recipeKeys.favorites(userId),
    queryFn: () => usersApi.getFavorites(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to fetch user's recipes
export function useUserRecipes(
  userId: number,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: recipeKeys.userRecipes(userId, page, pageSize),
    queryFn: () => usersApi.getRecipes(userId, page, pageSize),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook to create a new recipe
export function useCreateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecipeDto) => recipesApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch recipe lists
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

// Hook to update a recipe
export function useUpdateRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<Recipe> | CreateRecipeDto;
    }) => recipesApi.update(id, data),
    onSuccess: (updatedRecipe) => {
      // Update the specific recipe in cache
      queryClient.setQueryData(
        recipeKeys.detail(updatedRecipe.data.id),
        updatedRecipe.data
      );
      // Invalidate lists to refresh any lists containing this recipe
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

// Hook to delete a recipe
export function useDeleteRecipe() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recipesApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the deleted recipe from cache
      queryClient.removeQueries({ queryKey: recipeKeys.detail(deletedId) });
      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
}

// Hook to toggle recipe favorite status
export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isFavorited,
    }: {
      id: number;
      isFavorited: boolean;
    }) => {
      if (isFavorited) {
        return recipesApi.unfavorite(id);
      } else {
        return recipesApi.favorite(id);
      }
    },
    onSuccess: (_, { id, isFavorited }) => {
      // Optimistically update the recipe's favorite status
      queryClient.setQueryData(
        recipeKeys.detail(id),
        (old: Recipe | undefined) => {
          if (!old) return old;
          return {
            ...old,
            isFavorited: !isFavorited,
          };
        }
      );
      // Invalidate favorite-related queries
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
    },
  });
}
