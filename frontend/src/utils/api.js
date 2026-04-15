const BASE = "https://your-backend.onrender.com/api"; 
// ⚠️ change later after backend deploy

export async function api(path, method = "GET", body) {
  const token = localStorage.getItem("token");

  const res = await fetch(BASE + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: "Bearer " + token }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "API error");
  }

  return res.json();
}
