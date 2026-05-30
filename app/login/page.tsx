'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction } from '@/app/actions/auth'
import FormField from '@/src/component/FormField'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      const result = await loginAction(username, password)
      if (!result.success) {
        if (result.code === 'USER_NOT_FOUND') {
          setError('No user found.')
        } else if (result.code === 'WRONG_PASSWORD') {
          setError('Incorrect password.')
        } else {
          setError(result.message || 'Something went wrong. Please try again.')
        }
        return
      }
      localStorage.setItem('auth_user', JSON.stringify(result.user))
      router.push('/')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="loginPage">
      <div className="loginCard">
        <h1 className="shopTitle loginTitle">Sign in</h1>

        <form className="productForm" onSubmit={handleSubmit} noValidate>
          <div className="formGrid">
            <FormField label="Username">
              <input
                className="formInput"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
                required
              />
            </FormField>

            <FormField label="Password">
              <input
                className="formInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
                required
              />
            </FormField>
          </div>

          {error && <p className="shopStatus shopStatusError">{error}</p>}

          <div className="formActions">
            <button type="submit" className="primaryButton loginButton" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  ) 
}
