'use client';

import { useState } from 'react';
import { Resolver, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useCreateUserMutation, useLazyGetStaffUserByUsernameQuery } from '@/src/store/productsApi';

export interface UserFormValues {
  avatar: string;
  name: string;
  username: string;
  password: string;
}

export const userFormSchema = z.object({
  avatar: z.string().trim().url('Avatar must be a valid URL'),
  name: z.string().trim().min(1, 'Name is required'),
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().trim().min(6, 'Password must be at least 6 characters'),
});

const DEFAULT_FORM_VALUES: UserFormValues = {
  avatar: '',
  name: '',
  username: '',
  password: '',
};

const useAddStaff = () => {
  const router = useRouter();
  const [createUser] = useCreateUserMutation();
  const [checkUsername] = useLazyGetStaffUserByUsernameQuery();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema) as Resolver<UserFormValues>,
    defaultValues: DEFAULT_FORM_VALUES,
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

  return {
    register,
    handleSubmit,
    setError,
    control,
    errors,
    isSubmitting,
    submitError,
    onSubmit,
    goBack,
    avatarPreview,
  };
};

export default useAddStaff;
