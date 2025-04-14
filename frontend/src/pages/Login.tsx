import { useState } from "react";
import { login } from "../services/auth.ts";
import React from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(email, password);
      localStorage.setItem("token", response.token);
      window.location.href = "/main";
    } catch (error) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className='flex flex-row items-center justify-center h-screen bg-gray-100'>
      <div className="flex-1 basis-1/3">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <p className="mb-4">Please enter your credentials to login.</p>
      </div>
      <div className="flex-auto basis-1/3 bg-white p-6 rounded shadow-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 max-w-sm mx-auto mt-10">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
          <button type="submit" className="bg-blue-600 text-white p-2 rounded">Login</button>
        </form>
    </div>
    </div>
  );
}
