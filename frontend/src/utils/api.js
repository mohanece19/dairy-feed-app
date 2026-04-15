// src/utils/api.js

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000/api";

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

  // ❌ REMOVE auto redirect
  if (res.status === 401) {
    console.warn("Unauthorized - please login");
    return null; // prevent crash
  }

  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    throw new Error(data || "API error");
  }

  return data;
}
