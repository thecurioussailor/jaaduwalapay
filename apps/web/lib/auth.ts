export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export function clearToken(): void {
  localStorage.removeItem('token')
}
