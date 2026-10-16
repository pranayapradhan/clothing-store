import {
useMutation,
useQuery,
useQueryClient,
} from "@tanstack/react-query";

import {
createAdminProduct,
createAdminVariant,
deleteAdminProduct,
activateAdminProduct,
deleteAdminVariant,
updateAdminProduct,
updateAdminVariant,
getAdminProducts,
type AdminProductFilters,
getAdminProductById
} from "./admin-product.service";

const productsQueryKey = ["products"];

export const adminProductsQueryKey = (
filters: AdminProductFilters
) => [
"admin",
"products",
filters,
];

const invalidateProductQueries = (
queryClient: ReturnType<typeof useQueryClient>
) => {
queryClient.invalidateQueries({
queryKey: productsQueryKey,
});

queryClient.invalidateQueries({
queryKey: ["admin", "products"],
});
};

export const useCreateAdminProduct = () => {
const queryClient = useQueryClient();

return useMutation({
mutationFn: createAdminProduct,

onSuccess: () => {
  invalidateProductQueries(queryClient);
},

});
};

export const useUpdateAdminProduct = () => {
const queryClient = useQueryClient();

return useMutation({
mutationFn: ({
productId,
payload,
}: {
productId: string;
payload: Parameters<typeof updateAdminProduct>[1];
}) =>
updateAdminProduct(productId, payload),

onSuccess: () => {
  invalidateProductQueries(queryClient);
},

});
};

export const useDeactivateAdminProduct = () => {
const queryClient = useQueryClient();

return useMutation({
mutationFn: deleteAdminProduct,

onSuccess: () => {
  invalidateProductQueries(queryClient);
},

});
};

export const useActivateAdminProduct = () => {
const queryClient = useQueryClient();

return useMutation({
mutationFn: activateAdminProduct,

onSuccess: () => {
  invalidateProductQueries(queryClient);
},

});
};

export const useAdminProduct = (productId: string | undefined) => {
  return useQuery({
    queryKey: ["admin", "products", "detail", productId],
    queryFn: () => getAdminProductById(productId!),
    enabled: Boolean(productId),
    staleTime: 30 * 1000,
  });
};

export const useCreateAdminVariant = () => {
const queryClient = useQueryClient();

return useMutation({
mutationFn: createAdminVariant,

onSuccess: () => {
  invalidateProductQueries(queryClient);
},

});
};

export const useUpdateAdminVariant = () => {
const queryClient = useQueryClient();

return useMutation({
mutationFn: ({
variantId,
payload,
}: {
variantId: string;
payload: Parameters<typeof updateAdminVariant>[1];
}) =>
updateAdminVariant(variantId, payload),

onSuccess: () => {
  invalidateProductQueries(queryClient);
},

});
};

export const useDeleteAdminVariant = () => {
const queryClient = useQueryClient();

return useMutation({
mutationFn: deleteAdminVariant,

onSuccess: () => {
  invalidateProductQueries(queryClient);
},

});
};

export const useAdminProducts = (
filters: AdminProductFilters = {}
) => {
return useQuery({
queryKey: adminProductsQueryKey(filters),

queryFn: () =>
  getAdminProducts(filters),

placeholderData: (previousData) =>
  previousData,

staleTime: 30 * 1000,

});
};