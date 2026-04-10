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

/**
 * Keys that the app writes to localStorage and that should be wiped on logout
 * so that a shared device does not leak state between users.
 *
 * NOTE: storing the JWT in localStorage exposes it to any XSS on the page.
 * The XSS surface is minimized by validating rich-text URLs (see NoteEditor),
 * but a fully-hardened setup would move the token to an HTTP-only cookie set
 * by the backend. See README.md for the trade-off.
 */
const STORAGE_KEYS = ['token', 'email', 'darkMode', 'appBackground', 'sidebarCollapsed'] as const

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
  for (const key of STORAGE_KEYS) {
    localStorage.removeItem(key)
  }
}
