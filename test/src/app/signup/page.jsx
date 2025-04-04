"use client";
import { useState } from "react";

export default function Signup() {
  const [form, setForm] = useState({ username: "", password: "", email: "" });
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/graphql/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `
          mutation {
            signup(username: "${form.username}", password: "${form.password}", email: "${form.email}") {
              user { id username email }
              token
              error
            }
          }
        `
      }),
    });

    const data = await res.json();
    if (data.data.signup.error) setMsg(data.data.signup.error);
    else setMsg("Signup successful!");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Username" onChange={(e) => setForm({ ...form, username: e.target.value })} />
      <input type="email" placeholder="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button type="submit">Sign Up</button>
      <p>{msg}</p>
    </form>
  );
}
