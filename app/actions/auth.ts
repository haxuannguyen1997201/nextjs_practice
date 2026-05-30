'use server'

import { cookies } from 'next/headers'

interface UpstreamUser {
  password?: string
  [key: string]: unknown
}

interface LoginResult {
  success: boolean
  user?: UpstreamUser
  code?: string
  message?: string
}

async function fetchUsersByUsername(apiBase: string, username: string): Promise<UpstreamUser[]> {
  const resources = ['login', 'users']
  const queryKeys = ['username', 'userName', 'name', 'email']

  for (const resource of resources) {
    for (const key of queryKeys) {
      const query = new URLSearchParams({ [key]: username })
      const response = await fetch(`${apiBase}/${resource}?${query.toString()}`, { cache: 'no-store' })

      if (!response.ok) {
        if (response.status === 404) continue
        throw new Error(`Request failed: ${response.status}`)
      }

      const data = await response.json()
      if (Array.isArray(data)) return data as UpstreamUser[]
      if (data && typeof data === 'object') return [data as UpstreamUser]
      return []
    }
  }

  return []
}

export async function loginAction(username: string, password: string): Promise<LoginResult> {
  const apiBase = process.env.NEXT_PUBLIC_API_URL
  if (!apiBase) {
    return {
      success: false,
      code: 'UNKNOWN',
      message: 'API URL is not configured.',
    }
  }

  const cleanUsername = String(username ?? '').trim()
  const cleanPassword = String(password ?? '')
  if (!cleanUsername || !cleanPassword) {
    return {
      success: false,
      code: 'UNKNOWN',
      message: 'Username and password are required.',
    }
  }

  let userList: UpstreamUser[] = []
  try {
    userList = await fetchUsersByUsername(apiBase, cleanUsername)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to reach upstream auth service.'
    return { success: false, code: 'UNKNOWN', message }
  }

  if (userList.length === 0) {
    return {
      success: false,
      code: 'USER_NOT_FOUND',
      message: 'No user found.',
    }
  }

  const matched = userList.find((user) => String(user?.password ?? '') === cleanPassword)

  if (!matched) {
    return {
      success: false,
      code: 'WRONG_PASSWORD',
      message: 'Incorrect password.',
    }
  }

  const safeUser = { ...matched }
  delete safeUser.password

  // Set HttpOnly cookie
  const cookieStore = await cookies()
  cookieStore.set('auth_token', '1', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  })

  return {
    success: true,
    user: safeUser,
  }
}

export async function logoutAction(): Promise<{ success: boolean }> {
  const cookieStore = await cookies()
  cookieStore.set('auth_token', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
  return { success: true }
}
