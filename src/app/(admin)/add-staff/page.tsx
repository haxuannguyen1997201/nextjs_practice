'use client';

import { useMemo, useState } from 'react';
import { Resolver, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateUserMutation, useLazyGetStaffUserByUsernameQuery } from '@/src/store/productsApi';
import FormField from '@/src/component/FormField';
import FormActions from '@/src/component/FormActions';

interface UserFormValues {
  avatar: string;
  name: string;
  username: string;
  password: string;
}

const userFormSchema = z.object({
  avatar: z.string().trim().url('Avatar must be a valid URL'),
  name: z.string().trim().min(1, 'Name is required'),
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().trim().min(6, 'Password must be at least 6 characters'),
});

export default function AddStaffPage() {
  const router = useRouter();
  const [createUser] = useCreateUserMutation();
  const [checkUsername] = useLazyGetStaffUserByUsernameQuery();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const defaultValues = useMemo(
    () => ({
      avatar: '',
      name: '',
      username: '',
      password: '',
    }) as UserFormValues,
    []
  );

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema) as Resolver<UserFormValues>,
    defaultValues,
    mode: 'onSubmit',
  });

  async function onSubmit(values: UserFormValues) {
    setSubmitError(null);
    try {
      let existingUsers = [] as unknown[];
      try {
        existingUsers = await checkUsername(values.username).unwrap();
      } catch (usernameError) {
        if (
          typeof usernameError === 'object' &&
          usernameError !== null &&
          'status' in usernameError &&
          (usernameError as { status: number }).status === 404
        ) {
          existingUsers = [];
        } else {
          throw usernameError;
        }
      }

      if (existingUsers.length > 0) {
        setError('username', {
          type: 'manual',
          message: 'Username already exists. Choose a different one.',
        });
        return;
      }

      await createUser({
        payload: {
          avatar: values.avatar,
          name: values.name,
          username: values.username,
          password: values.password,
          role: 'staff',
          createdAt: new Date().toISOString(),
        },
      }).unwrap();

      router.push('/users');
    } catch (err) {
      setSubmitError('Failed to create staff user. Please try again.');
    }
  }

  function goBack() {
    router.back();
  }

  const avatarPreview = useWatch({ control, name: 'avatar' });

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
