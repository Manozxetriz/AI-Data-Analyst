const API_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = localStorage.getItem("access_token");

  const headers = new Headers(options.headers);

  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // JWT expired, remove token and redirect to login page
  if (response.status === 401) {
    localStorage.removeItem("access_token");

    window.location.href = "/login";

    throw new Error("Session expired. Please login again.");
  }

  return response;
}