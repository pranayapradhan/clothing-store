import { api } from "../../services/api";
import type { Product, ProductVariant } from "../../types/product";

export interface CreateAdminProductPayload {
name: string;
slug: string;
description?: string;
brand?: string;
categoryId: string;
basePrice: number;
discountPrice?: number | null;
mainImage?: File;
images?: File[];
isActive?: boolean;
}

export interface UpdateAdminProductPayload {
name?: string;
slug?: string;
description?: string;
brand?: string;
categoryId?: string;
basePrice?: number;
discountPrice?: number | null;
mainImage?: File;
images?: File[];
removeMainImage?: boolean;
removeImagePublicIds?: string[];
imagePublicIds?: string[];
isActive?: boolean;
}

export interface CreateAdminVariantPayload {
productId: string;
color?: string;
colorCode?: string;
size?: string;
sku: string;
price: number;
isActive?: boolean;
}

export interface UpdateAdminVariantPayload {
color?: string;
colorCode?: string;
size?: string;
sku?: string;
price?: number;
isActive?: boolean;
}

export interface AdminProductFilters {
search?: string;
status?: "all" | "active" | "inactive";
page?: number;
limit?: number;
}

export interface AdminProductsResponse {
success: boolean;
data: {
products: Product[];
pagination: {
page: number;
limit: number;
total: number;
totalPages: number;
hasNextPage: boolean;
hasPreviousPage: boolean;
};
};
}

interface ProductResponse {
success: boolean;
data: Product;
}

interface VariantResponse {
success: boolean;
data: ProductVariant;
}

const appendIfDefined = (
formData: FormData,
key: string,
value: unknown,
) => {
if (value === undefined || value === null) {
return;
}

formData.append(key, String(value));
};

const createProductFormData = (
payload: CreateAdminProductPayload,
): FormData => {
const formData = new FormData();

appendIfDefined(formData, "name", payload.name);
appendIfDefined(formData, "slug", payload.slug);
appendIfDefined(formData, "description", payload.description);
appendIfDefined(formData, "brand", payload.brand);
appendIfDefined(formData, "categoryId", payload.categoryId);
appendIfDefined(formData, "basePrice", payload.basePrice);
appendIfDefined(formData, "discountPrice", payload.discountPrice);
appendIfDefined(formData, "isActive", payload.isActive);

if (payload.mainImage) {
formData.append("mainImage", payload.mainImage);
}

payload.images?.forEach((image) => {
formData.append("images", image);
});

return formData;
};

const updateProductFormData = (
payload: UpdateAdminProductPayload,
): FormData => {
const formData = new FormData();

appendIfDefined(formData, "name", payload.name);
appendIfDefined(formData, "slug", payload.slug);
appendIfDefined(formData, "description", payload.description);
appendIfDefined(formData, "brand", payload.brand);
appendIfDefined(formData, "categoryId", payload.categoryId);
appendIfDefined(formData, "basePrice", payload.basePrice);
appendIfDefined(formData, "discountPrice", payload.discountPrice);
appendIfDefined(formData, "isActive", payload.isActive);

if (payload.mainImage) {
formData.append("mainImage", payload.mainImage);
}

payload.images?.forEach((image) => {
formData.append("images", image);
});

if (payload.removeMainImage !== undefined) {
formData.append(
"removeMainImage",
String(payload.removeMainImage),
);
}

if (payload.removeImagePublicIds !== undefined) {
formData.append(
"removeImagePublicIds",
JSON.stringify(payload.removeImagePublicIds),
);
}

if (payload.imagePublicIds !== undefined) {
formData.append(
"imagePublicIds",
JSON.stringify(payload.imagePublicIds),
);
}

return formData;
};

export const createAdminProduct = async (
payload: CreateAdminProductPayload,
): Promise<ProductResponse> => {
const formData = createProductFormData(payload);

const response = await api.post<ProductResponse>(
"/admin/products",
formData,
{
headers: {
"Content-Type": "multipart/form-data",
},
},
);

return response.data;
};

export const updateAdminProduct = async (
productId: string,
payload: UpdateAdminProductPayload,
): Promise<ProductResponse> => {
const formData = updateProductFormData(payload);

const response = await api.patch<ProductResponse>(
`/admin/products/${productId}`,
formData,
{
headers: {
"Content-Type": "multipart/form-data",
},
},
);

return response.data;
};

export const deleteAdminProduct = async (
productId: string,
): Promise<{ success: boolean; message: string }> => {
const response = await api.delete<{
success: boolean;
message: string;
}>(`/admin/products/${productId}`);

return response.data;
};

export const activateAdminProduct = async (
productId: string,
): Promise<{ success: boolean; message: string }> => {
const response = await api.patch<{
success: boolean;
message: string;
}>(`/admin/products/${productId}/activate`);

return response.data;
};

export const getAdminProducts = async (
filters: AdminProductFilters = {},
): Promise<AdminProductsResponse> => {
const response = await api.get<AdminProductsResponse>(
"/admin/products",
{
params: {
search: filters.search || undefined,
status: filters.status || "all",
page: filters.page || 1,
limit: filters.limit || 20,
},
},
);

return response.data;
};

export const getAdminProductById = async (
productId: string,
): Promise<ProductResponse> => {
const response = await api.get<ProductResponse>(
`/admin/products/${productId}`,
);

return response.data;
};

export const createAdminVariant = async (
payload: CreateAdminVariantPayload,
): Promise<VariantResponse> => {
const response = await api.post<VariantResponse>(
"/admin/products/variants",
payload,
);

return response.data;
};

export const updateAdminVariant = async (
variantId: string,
payload: UpdateAdminVariantPayload,
): Promise<VariantResponse> => {
const response = await api.patch<VariantResponse>(
`/admin/products/variants/${variantId}`,
payload,
);

return response.data;
};

export const deleteAdminVariant = async (
variantId: string,
): Promise<{ success: boolean; message: string }> => {
const response = await api.delete<{
success: boolean;
message: string;
}>(`/admin/products/variants/${variantId}`);

return response.data;
};