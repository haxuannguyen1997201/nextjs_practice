'use client';

import { useMemo, useState } from 'react';
import { Resolver, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useCreateProductMutation } from '@/src/store/productsApi';
import {
  createDefaultProductFormValues,
  formValuesToApiPayload,
  productFormSchema,
} from '@/src/api/productFormModel';
import type { ProductFormValues } from '@/src/models/product';
import ProductForm from '@/src/component/ProductForm';

export default function AddProductPage() {
  const router = useRouter();
  const [createProduct] = useCreateProductMutation();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const defaultValues = useMemo(() => createDefaultProductFormValues() as ProductFormValues, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormValues>,
    defaultValues,
    mode: 'onSubmit',
  });

  async function onSubmit(values: ProductFormValues) {
    setSubmitError(null);
    try {
      await createProduct(formValuesToApiPayload(values)).unwrap();
      router.push('/');
    } catch (err) {
      setSubmitError(err);
    }
  }

  function goBack() {
    router.back();
  }

  const previewUrl = useWatch({ control, name: 'image' });

  return (
    <ProductForm
      title="Add product"
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      onFormSubmit={handleSubmit(onSubmit)}
      onCancel={goBack}
      submitLabel="Save product"
      submitError={submitError}
      imagePreviewUrl={previewUrl}
      tips={
        <>
          <p className="shopStatus">Use a public image URL (http/https).</p>
          <p className="shopStatus">Color is used by the filter list.</p>
        </>
      }
    />
  );
}
