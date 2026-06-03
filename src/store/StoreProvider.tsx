'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { useDispatch } from 'react-redux';
import { store } from './store';
import { setUser } from './authSlice';
import type { AuthUser } from '@/src/models/auth';
import type { AppDispatch } from './store';

function HydrationInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Manually restore auth state from localStorage on mount
    try {
      const persisted = localStorage.getItem('persist:root');
      if (persisted) {
        const data = JSON.parse(persisted);
        if (data.auth) {
          const authState = JSON.parse(data.auth);
          if (authState.user) {
            dispatch(setUser(authState.user as AuthUser));
          }
        }
      }
    } catch (error) {
      console.warn('Failed to restore auth state:', error);
    }
  }, [dispatch]);

  return <>{children}</>;
}

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <HydrationInitializer>{children}</HydrationInitializer>
    </Provider>
  );
}
