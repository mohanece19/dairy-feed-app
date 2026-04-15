const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export async function api(path, method = "GET", body) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // ✅ HANDLE UNAUTHORIZED INSIDE FUNCTION
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/";
    return;
  }

  // ✅ HANDLE OTHER ERRORS
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "API error");
  }

  return res.json();
}
