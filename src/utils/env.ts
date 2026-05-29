export function getRequiredEnv(name: string): string {
  const value = process.env[name as keyof typeof process.env];
  if (!value || String(value).trim().length === 0) {
    throw new Error(
      `${name} is required. Copy env.example to .env.local and set ${name}.`
    );
  }
  return String(value);
}

export function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL;
  
  // On client side, process.env might not have NEXT_PUBLIC_API_URL during module evaluation
  // Return it if available, otherwise return empty string (fetchBaseQuery will handle it)
  if (typeof window !== 'undefined' && (!value || String(value).trim().length === 0)) {
    return '';
  }
   
  // On server side, always require it
  if (typeof window === 'undefined') {
    return getRequiredEnv('NEXT_PUBLIC_API_URL');
  }
  
  return String(value);
}
