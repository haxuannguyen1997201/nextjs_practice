'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Resolver, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useUpdateUserMutation } from '../store/productsApi.js';
import type { ApiUser } from '../models/user';
import FormField from './FormField';
import FormActions from './FormActions';

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
  password: z.string().min(1, 'Password is required'),
});

interface UserDetailScreenProps {
  userId: string;
  initialUser: ApiUser | null;
}

export default function UserDetailScreen({ userId, initialUser }: UserDetailScreenProps) {
  const router = useRouter();
  const [updateUser] = useUpdateUserMutation();
  const [submitError, setSubmitError] = useState<unknown>(null);

  const defaultValues = useMemo(
    () =>
      ({
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
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema) as Resolver<UserFormValues>,
    defaultValues,
    mode: 'onSubmit',
  });

  useEffect(() => {
    if (!initialUser) return;
    reset({
      avatar: initialUser.avatar ?? '',
      name: initialUser.name ?? '',
      username: initialUser.username ?? '',
      password: initialUser.password ?? '',
    });
  }, [initialUser, reset]);

  async function onSubmit(values: UserFormValues) {
    setSubmitError(null);
    try {
      await updateUser({
        userId,
        payload: {
          ...initialUser,
          avatar: values.avatar,
          name: values.name,
          username: values.username,
          password: values.password,
          role: 'staff',
        },
      }).unwrap();
      router.push('/users');
    } catch (err) {
      setSubmitError(err);
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
          <h1 className="shopTitle">User detail</h1>
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
                    type="text"
                    placeholder="Password"
                    disabled={isSubmitting}
                    {...register('password')}
                  />
                </FormField>
              </div>

              {!!submitError && <p className="shopStatus shopStatusError">Failed to edit user.</p>}

              <FormActions
                onCancel={goBack}
                isSubmitting={isSubmitting}
                submitLabel="Edit user"
                submitDisabled={userId.length === 0}
              />
            </form>
          </div>
        </main>

        <aside className="addProductSidebar" aria-label="Preview">
          <div className="filterCard">
            <h2 className="filterTitle">Avatar preview</h2>
            <div className="addProductTips">
              {avatarPreview ? (
                <Image
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
