export interface ProductVariant {
  id: string;
  productId: string;
  color: string;
  colorCode: string;
  size: string;
  sku: string;
  price: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  basePrice: string;
  discountPrice: string | null;
  mainImage: string | null;
  images: string[];
  mainImagePublicId: string | null;
imagePublicIds: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategory;
  variants?: ProductVariant[];
}