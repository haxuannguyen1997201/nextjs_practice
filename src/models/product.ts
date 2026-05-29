export interface ApiProduct {
  id?: string | number;
  productName?: string;
  image?: string;
  summary?: string;
  price?: number | string;
  color?: string;
  createdAt?: string;
}

export interface ShopProduct {
  id?: string | number;
  name?: string;
  image?: string;
  summary?: string;
  price?: number | string;
  color?: string;
  createdAt?: string;
}

export interface ProductFormValues {
  name: string;
  image: string;
  summary: string;
  price: number | string;
  color: string;
}