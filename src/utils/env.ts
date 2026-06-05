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
  if (!value || String(value).trim().length === 0) {
    throw new Error(
      'NEXT_PUBLIC_API_URL is required. Copy env.example to .env.local and set NEXT_PUBLIC_API_URL.'
    );
  }
  return value;
}
