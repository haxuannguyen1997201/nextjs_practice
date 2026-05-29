export interface ApiUser {
  id?: string | number;
  avatar?: string;
  name?: string;
  username?: string;
  password?: string;
  role?: string;
  createdAt?: string;
}

export type StaffUserRow = Omit<ApiUser, 'role' | 'password'>;