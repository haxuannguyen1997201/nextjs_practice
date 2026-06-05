'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ToastNotice } from '@/src/models/ui';

const TOAST_DURATION_MS = 2600;

export function useToastNotification() {
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);

  useEffect(() => {
    if (!toastNotice) return;
    const timeoutId = window.setTimeout(() => {
      setToastNotice(null);
    }, TOAST_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [toastNotice]);

  const showToast = useCallback((notice: ToastNotice) => {
    setToastNotice(notice);
  }, []);

  return { toastNotice, showToast };
}
