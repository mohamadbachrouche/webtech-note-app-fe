import axios from 'axios'

const authClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface AuthResponse {
  token: string
  email: string
}

export function login(email: string, password: string) {
  return authClient.post<AuthResponse>('/auth/login', { email, password })
}

export function register(email: string, password: string) {
  return authClient.post<AuthResponse>('/auth/register', { email, password })
}

export function saveAuth(response: AuthResponse) {
  localStorage.setItem('token', response.token)
  localStorage.setItem('email', response.email)
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

export function getEmail(): string | null {
  return localStorage.getItem('email')
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token')
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
}
