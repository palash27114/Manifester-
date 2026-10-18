// Empty by default so requests go to /api on the same origin (Vite proxy in dev, nginx in Docker).
export const API_URL = `${import.meta.env.VITE_API_URL ?? ''}/api`

export async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    throw new Error("Can't reach the server. Is the backend running?")
  }

  const body = await response.json().catch(() => null)

  if (!response.ok || !body?.success) {
    throw new Error(body?.message || `Request failed (${response.status})`)
  }

  return body.data
}
