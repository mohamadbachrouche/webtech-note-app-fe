import axios from 'axios'
import router from '@/router'

const TOKEN_KEY = 'auth_token'

const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

interface AuthResponse {
  token: string
}

export async function login(email: string, password: string): Promise<string> {
  const response = await authClient.post<AuthResponse>('/auth/login', { email, password })
  const { token } = response.data
  localStorage.setItem(TOKEN_KEY, token)
  return token
}

export async function register(email: string, password: string): Promise<string> {
  const response = await authClient.post<AuthResponse>('/auth/register', { email, password })
  const { token } = response.data
  localStorage.setItem(TOKEN_KEY, token)
  return token
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY)
  router.push('/login')
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getToken())
}
