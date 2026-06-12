import { z } from 'zod';

function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  image: z
    .string()
    .trim()
    .min(1, 'Image URL is required')
    .refine((value) => isValidHttpUrl(value), 'Image must be a valid URL'),
  summary: z.string().trim().min(1, 'Summary is required'),
  price: z.preprocess(
    (value) => {
      if (value === '' || value == null) return NaN;
      return typeof value === 'number' ? value : Number(value);
    },
    z.number().refine((val) => !Number.isNaN(val), 'Price is required').min(0, 'Price must be ≥ 0')
  ),
  color: z.string().trim().min(1, 'Color is required'),
});

import type { ApiProduct } from '../models/product';

export type ProductFormValues = z.infer<typeof productFormSchema>;

export function createDefaultProductFormValues(): ProductFormValues {
  return {
    name: '',
    image: '',
    summary: '',
    price: 1,
    color: '',
  };
}

export function apiProductToFormValues(product?: ApiProduct | null): ProductFormValues {
  if (!product) {
    return createDefaultProductFormValues();
  }

  return {
    name: product.productName ?? '',
    image: product.image ?? '',
    summary: product.summary ?? '',
    price: product.price ?? 1,
    color: product.color ?? '',
  };
}

export function formValuesToApiPayload(values: ProductFormValues) {
  return {
    productName: values.name,
    image: values.image,
    summary: values.summary,
    price: values.price,
    color: values.color,
  };
}
