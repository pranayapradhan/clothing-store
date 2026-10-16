import {
useMutation,
useQuery,
useQueryClient,
} from "@tanstack/react-query";

import { adminCategoryService } from "./admin-category.service";

export const adminCategoriesQueryKey = [
"admin",
"categories",
];

export function useAdminCategories() {
return useQuery({
queryKey: adminCategoriesQueryKey,
queryFn: adminCategoryService.getCategories,
staleTime: 30 * 1000,
});
}

export function useCreateCategory() {
const queryClient = useQueryClient();

return useMutation({
mutationFn: adminCategoryService.createCategory,

onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: adminCategoriesQueryKey,
  });

  queryClient.invalidateQueries({
    queryKey: ["categories"],
  });
},

});
}

export function useUpdateCategory() {
const queryClient = useQueryClient();

return useMutation({
mutationFn: ({
categoryId,
payload,
}: {
categoryId: string;
payload: Parameters<
typeof adminCategoryService.updateCategory
>[1];
}) =>
adminCategoryService.updateCategory(
categoryId,
payload
),

onSuccess: () => {
  queryClient.invalidateQueries({
    queryKey: adminCategoriesQueryKey,
  });

  queryClient.invalidateQueries({
    queryKey: ["categories"],
  });
},

});
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:
      adminCategoryService.deactivateCategory,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminCategoriesQueryKey,
      });

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });
}

export function useActivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn:
      adminCategoryService.activateCategory,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminCategoriesQueryKey,
      });

      queryClient.invalidateQueries({
        queryKey: ["categories"],
      });
    },
  });
}

export function useAdminCategory(
  categoryId: string
) {
  return useQuery({
    queryKey: [
      "admin",
      "categories",
      "detail",
      categoryId,
    ],
    queryFn: () =>
      adminCategoryService.getCategoryById(
        categoryId
      ),
    enabled: Boolean(categoryId),
    staleTime: 30 * 1000,
  });
}