import { z } from 'zod'

function isValidHttpUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
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
      if (value === '' || value == null) return NaN
      return typeof value === 'number' ? value : Number(value)
    },
    z.number({ invalid_type_error: 'Price is required' }).finite('Price is required').min(0, 'Price must be ≥ 0')
  ),
  color: z.string().trim().min(1, 'Color is required'),
})

export function createDefaultProductFormValues() {
  return {
    name: '',
    image: '',
    summary: '',
    price: '',
    color: '',
  }
}

export function apiProductToFormValues(apiProduct) {
  return {
    name: apiProduct?.productName ?? '',
    image: apiProduct?.image ?? '',
    summary: apiProduct?.summary ?? '',
    price: apiProduct?.price ?? '',
    color: apiProduct?.color ?? '',
  }
}

export function formValuesToApiPayload(values) {
  return {
    productName: values.name,
    image: values.image,
    summary: values.summary,
    price: values.price,
    color: values.color,
  }
}
