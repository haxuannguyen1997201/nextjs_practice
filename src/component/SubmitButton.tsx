'use client';

import { useFormStatus } from 'react-dom';

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div className="formActions">
      <button type="submit" className="primaryButton loginButton" disabled={pending} aria-disabled={pending}>
        {pending ? 'Signing in...' : 'Sign in'}
      </button>
    </div>
  );
}
