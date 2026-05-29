'use client';

import { useEffect, useMemo, useState } from 'react';
import { Resolver, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useUpdateProductMutation } from '../store/productsApi';
import {
  apiProductToFormValues,
  createDefaultProductFormValues,
  formValuesToApiPayload,
  productFormSchema,
} from '../api/productFormModel';
import type { ApiProduct, ProductFormValues } from '../models/product';
import ProductForm from './ProductForm';

interface ProductDetailScreenProps {
  productId: string;
  initialProduct: ApiProduct | null;
}

export default function ProductDetailScreen({
  productId,
  initialProduct,
}: ProductDetailScreenProps) {
  const router = useRouter();
  const [updateProduct] = useUpdateProductMutation();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const defaultValues = useMemo(() => createDefaultProductFormValues() as ProductFormValues, []);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as Resolver<ProductFormValues>,
    defaultValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (initialProduct) {
      reset(apiProductToFormValues(initialProduct) as ProductFormValues);
    }
  }, [initialProduct, reset]);

  async function onSubmit(values: ProductFormValues) {
    setSubmitError(null);
    try {
      await updateProduct({ productId, payload: formValuesToApiPayload(values) }).unwrap();
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
      title="Product detail"
      register={register}
      errors={errors}
      isSubmitting={isSubmitting}
      onFormSubmit={handleSubmit(onSubmit)}
      onCancel={goBack}
      submitLabel="Edit product"
      submitDisabled={productId.length === 0}
      isLoading={false}
      loadError={!initialProduct && productId.length > 0 ? new Error('Not found') : null}
      submitError={submitError}
      imagePreviewUrl={previewUrl}
      tips={<p className="shopStatus">Edit and click &quot;Edit product&quot; to save.</p>}
    />
  );
}
