import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categories as categoriesApi } from "@/lib/api";
import type { Category } from "@/types/api";
import type { CreateCategoryDto } from "@/types/dto";

// Query keys for categories
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: () => [...categoryKeys.lists()] as const,
  details: () => [...categoryKeys.all, "detail"] as const,
  detail: (id: number) => [...categoryKeys.details(), id] as const,
};

// Hook to fetch all categories
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.list(),
    queryFn: async () => {
      const response = await categoriesApi.getAll();
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - categories don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook to fetch a single category by ID
export function useCategory(id: number) {
  return useQuery({
    queryKey: categoryKeys.detail(id),
    queryFn: () => categoriesApi.getById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
}

// Hook to create a new category
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => categoriesApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch category lists
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

// Hook to update a category
export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Category> }) =>
      categoriesApi.update(id, data),
    onSuccess: (_, variables) => {
      // Update the specific category in cache
      queryClient.setQueryData(
        categoryKeys.detail(variables.id),
        (old: Category | undefined) => {
          if (!old) return old;
          return { ...old, ...variables.data };
        }
      );
      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}

// Hook to delete a category
export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: (_, deletedId) => {
      // Remove the deleted category from cache
      queryClient.removeQueries({ queryKey: categoryKeys.detail(deletedId) });
      // Invalidate lists to refresh
      queryClient.invalidateQueries({ queryKey: categoryKeys.lists() });
    },
  });
}
