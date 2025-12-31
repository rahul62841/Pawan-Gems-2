export const apiBase = import.meta.env.VITE_API_URL || "";

export async function apiFetch(input: string, init?: RequestInit) {
  const url = input.startsWith("/") ? `${apiBase}${input}` : input;
  return fetch(url, init);
}

export default apiFetch;
