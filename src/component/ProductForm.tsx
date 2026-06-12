'use client';

import { ReactNode, useState } from 'react';
import Image from 'next/image';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import type { ProductFormValues } from '../models/product';
import FormField from './FormField';
import FormActions from './FormActions';

interface ProductFormProps {
  title: string;
  register: UseFormRegister<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
  isSubmitting: boolean;
  onFormSubmit: React.FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  submitLabel?: string;
  submitDisabled?: boolean;
  isLoading?: boolean;
  loadError?: unknown;
  submitError?: unknown;
  imagePreviewUrl?: string;
  tips?: ReactNode;
}

export default function ProductForm({
  title,
  register,
  errors,
  isSubmitting,
  onFormSubmit,
  onCancel,
  submitLabel = 'Save',
  submitDisabled = false,
  isLoading = false,
  loadError = null,
  submitError = null,
  imagePreviewUrl = '',
  tips,
}: ProductFormProps) {
  const disabled = isLoading || isSubmitting;
  const [failedPreviewUrl, setFailedPreviewUrl] = useState('');

  const previewUrl = String(imagePreviewUrl ?? '').trim();
  const isPreviewFailed = previewUrl.length > 0 && previewUrl === failedPreviewUrl;

  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <h1 className="shopTitle">{title}</h1>
          <div className="shopHeaderActions">
            <button type="button" className="secondaryButton" onClick={onCancel}>
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="addProductLayout">
        <main className="addProductMain">
          <div className="formCard">
            {isLoading && <p className="shopStatus">Loading...</p>}
            {!!loadError && <p className="shopStatus shopStatusError">Failed to load product.</p>}

            {!loadError && (
              <form className="productForm" onSubmit={onFormSubmit} noValidate>
                <div className="formGrid">
                  <FormField label="Name" error={errors.name?.message}>
                    <input
                      className="formInput"
                      type="text"
                      placeholder="Product name"
                      disabled={disabled}
                      {...register('name')}
                    />
                  </FormField>

                  <FormField label="Price (£)" error={errors.price?.message}>
                    <input
                      className="formInput"
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={disabled}
                      {...register('price')}
                    />
                  </FormField>

                  <FormField label="Color" error={errors.color?.message}>
                    <input
                      className="formInput"
                      type="text"
                      placeholder="e.g. Red"
                      disabled={disabled}
                      {...register('color')}
                    />
                  </FormField>

                  <FormField
                    label="Image URL"
                    error={errors.image?.message}
                    className="formFieldWide"
                  >
                    <input
                      className="formInput"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      disabled={disabled}
                      {...register('image')}
                    />

                    {previewUrl.length > 0 && (
                      <div className="imagePreview" aria-live="polite">
                        {!isPreviewFailed ? (
                          <Image
                            className="imagePreviewImg"
                            src={previewUrl}
                            alt="Product image preview"
                            width={520}
                            height={260}
                            onError={() => setFailedPreviewUrl(previewUrl)}
                          />
                        ) : (
                          <p className="imagePreviewFallback">Cannot load this image URL.</p>
                        )}
                      </div>
                    )}
                  </FormField>

                  <FormField
                    label="Summary"
                    error={errors.summary?.message}
                    className="formFieldWide"
                  >
                    <textarea
                      className="formTextarea"
                      rows={4}
                      placeholder="Short description"
                      disabled={disabled}
                      {...register('summary')}
                    />
                  </FormField>
                </div>

                {!!submitError && (
                  <p className="shopStatus shopStatusError">Failed to save product.</p>
                )}

                <FormActions
                  onCancel={onCancel}
                  isSubmitting={isSubmitting}
                  isLoading={isLoading}
                  submitDisabled={submitDisabled}
                  submitLabel={submitLabel}
                />
              </form>
            )}
          </div>
        </main>

        <aside className="addProductSidebar" aria-label="Tips">
          <div className="filterCard">
            <h2 className="filterTitle">Tips</h2>
            <div className="addProductTips">{tips}</div>
          </div>
        </aside>
      </div>
    </div>
  );
}
