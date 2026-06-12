'use client';

import { useState, useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { loginAction, type LoginState } from '@/src/app/actions/auth';
import { setUser } from '@/src/store/authSlice';
import type { AppDispatch } from '@/src/store/store';
import type { AuthUser } from '@/src/models/auth';

const useLogin = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [state, action] = useActionState<LoginState, FormData>(loginAction, null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (state?.success) {
      dispatch(setUser(state.user as AuthUser));
      const role = String((state.user as { role?: string })?.role ?? '')
        .trim()
        .toLowerCase();
      router.push(role === 'admin' ? '/users' : '/');
    }
  }, [state, router, dispatch]);

  return {
    action,
    username,
    setUsername,
    password,
    setPassword,
    errorMessage: state && !state.success ? state.message : null,
    fieldErrors: state && !state.success ? state.fieldErrors : null,
  };
};

export default useLogin;
