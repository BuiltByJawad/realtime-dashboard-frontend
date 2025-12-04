export type ProductStatus = 'active' | 'inactive';

export interface Product {
  id: string;
  name: string;
  price: number;
  status: ProductStatus;
  category?: string;
  stock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  name: string;
  price: number;
  status?: ProductStatus;
  category?: string;
  stock?: number;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  status?: ProductStatus;
  category?: string;
  stock?: number;
}