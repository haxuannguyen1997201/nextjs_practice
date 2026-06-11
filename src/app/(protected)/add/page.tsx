'use client';

import useAddProduct from '@/src/hooks/useAddProduct';
import ProductForm from '@/src/component/ProductForm';

export default function AddProductPage() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    submitError,
    onSubmit,
    goBack,
    previewUrl,
  } = useAddProduct();

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
