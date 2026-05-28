import { notFound } from 'next/navigation';
import UserDetailScreen from '@/src/component/UserDetailScreen';

interface ApiUser {
  id?: string | number;
  avatar?: string;
  name?: string;
  username?: string;
  password?: string;
  role?: string;
  createdAt?: string;
}

async function getUser(userId: string): Promise<ApiUser | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl || !userId) return null;

  const response = await fetch(`${baseUrl}/login/${encodeURIComponent(userId)}?role=staff`, {
    cache: 'no-store',
  });

  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Failed to load user (${response.status})`);

  const data = (await response.json()) as ApiUser;
  if (String(data?.role ?? '').toLowerCase() !== 'staff') return null;
  return data;
}

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const resolvedParams = await params;
  const userId = String(resolvedParams?.userId ?? '');
  const initialUser = await getUser(userId);

  if (initialUser === null) notFound();

  return <UserDetailScreen userId={userId} initialUser={initialUser} />;
}
