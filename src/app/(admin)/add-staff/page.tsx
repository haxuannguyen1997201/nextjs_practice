'use client';

import FormField from '@/src/component/FormField';
import FormActions from '@/src/component/FormActions';
import useAddStaff from '@/src/hooks/useAddStaff';

export default function AddStaffPage() {
  const {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    submitError,
    onSubmit,
    goBack,
    avatarPreview,
  } = useAddStaff();

  return (
    <div className="shopPage">
      <div className="shopHeader">
        <div className="shopHeaderRow">
          <h1 className="shopTitle">Add staff</h1>
          <div className="shopHeaderActions">
            <button type="button" className="secondaryButton" onClick={goBack}>
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="addProductLayout">
        <main className="addProductMain">
          <div className="formCard">
            <form className="productForm" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="formGrid">
                <FormField label="Avatar URL" error={errors.avatar?.message}>
                  <input
                    className="formInput"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    disabled={isSubmitting}
                    {...register('avatar')}
                  />
                </FormField>

                <FormField label="Name" error={errors.name?.message}>
                  <input
                    className="formInput"
                    type="text"
                    placeholder="Name"
                    disabled={isSubmitting}
                    {...register('name')}
                  />
                </FormField>

                <FormField label="Username" error={errors.username?.message}>
                  <input
                    className="formInput"
                    type="text"
                    placeholder="Username"
                    disabled={isSubmitting}
                    {...register('username')}
                  />
                </FormField>

                <FormField label="Password" error={errors.password?.message}>
                  <input
                    className="formInput"
                    type="password"
                    placeholder="Enter password (min 6 characters)"
                    disabled={isSubmitting}
                    {...register('password')}
                  />
                </FormField>
              </div>

              {!!submitError && <p className="shopStatus shopStatusError">{submitError}</p>}

              <FormActions
                onCancel={goBack}
                isSubmitting={isSubmitting}
                submitLabel="Create staff"
              />
            </form>
          </div>
        </main>

        <aside className="addProductSidebar" aria-label="Preview">
          <div className="filterCard">
            <h2 className="filterTitle">Avatar preview</h2>
            <div className="addProductTips">
              {avatarPreview ? (
                <img
                  className="imagePreviewImg"
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={280}
                  height={280}
                />
              ) : (
                <p className="shopStatus">Enter avatar URL to preview.</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
