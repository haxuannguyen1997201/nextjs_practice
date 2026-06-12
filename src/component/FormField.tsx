'use client';

import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export default function FormField({ label, error, className, children }: FormFieldProps) {
  return (
    <label className={['formField', className].filter(Boolean).join(' ')}>
      <span className="formLabel">{label}</span>
      {children}
      {error && <span className="formError">{error}</span>}
    </label>
  );
}
