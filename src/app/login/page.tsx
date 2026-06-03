'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginAction, type LoginState } from '@/src/app/actions/auth';
import { AuthUser, setUser } from '@/src/store/authSlice';
import FormField from '@/src/component/FormField';
import SubmitButton from '@/src/component/SubmitButton';
import { AppDispatch } from '@/src/store/store';
import { useDispatch } from 'react-redux';


export default function LoginPage() {
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

  const errorMessage = state && !state.success ? state.message : null;
  const fieldErrors = state && !state.success ? state.fieldErrors : null;

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h1 className="shopTitle loginTitle">Sign in</h1>

        <form className="productForm" action={action} noValidate>
          <div className="formGrid">
            <FormField label="Username" error={fieldErrors?.username?.[0]}>
              <input
                className="formInput"
                type="text"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </FormField>

            <FormField label="Password" error={fieldErrors?.password?.[0]}>
              <input
                className="formInput"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </FormField>
          </div>

          {errorMessage && <p className="shopStatus shopStatusError">{errorMessage}</p>}

          <SubmitButton />
        </form>
      </div>
    </div>
  );
}
