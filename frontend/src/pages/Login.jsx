import { useState } from "react";
import { api } from "../utils/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setErr("");
    setLoading(true);

    try {
      const data = await api("/auth/login", "POST", {
        username,
        password,
      });

      // ✅ store token
      localStorage.setItem("token", data.token);

      // optional: store role
      localStorage.setItem("role", data.user.role);

      // redirect
      window.location.href = "/dashboard";
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 300, margin: "100px auto" }}>
      <h2>Login</h2>

      {err && <p style={{ color: "red" }}>{err}</p>}

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>
    </div>
  );
}
