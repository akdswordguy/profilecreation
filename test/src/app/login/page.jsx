"use client";
import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8000/graphql/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // Send session cookie to Django
      body: JSON.stringify({
        query: `
          mutation {
            login(username: "${form.username}", password: "${form.password}") {
              user { id username email }
              error
            }
          }
        `
      }),
    });

    const data = await res.json();

    if (data.data?.login?.error) {
      setMsg(data.data.login.error);
    } else {
      setMsg("Login successful!");
      // redirect or route to profile, etc.
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        required
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
      />
      <button type="submit">Login</button>
      <p>{msg}</p>
    </form>
  );
}
