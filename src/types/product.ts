export type ProductCategory = "Phones" | "Accessories";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  images: string[];
  videoUrl?: string;
  available: boolean;
  featured: boolean;
  isNew?: boolean;
  specifications: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, "id" | "createdAt" | "updatedAt">;
