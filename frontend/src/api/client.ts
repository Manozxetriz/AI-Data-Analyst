const API_URL = import.meta.env.VITE_API_BASE_URL;

let isRedirecting = false;

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

  // JWT expired / invalid
  if (response.status === 401) {
    if (!isRedirecting) {
      isRedirecting = true;

      // Remove expired authentication data
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      // Tell App.tsx that authentication has expired
      window.dispatchEvent(new Event("auth-expired"));
    }

    throw new Error("Session expired. Please login again.");
  }

  return response;
}