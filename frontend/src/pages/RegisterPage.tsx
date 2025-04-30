import { useState } from "react";
import { register } from "../services/auth.ts";
import React from "react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log(email, password, confirmPassword);
    if (!email || !password || !confirmPassword) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await register(email, password);
      alert("Registration successful! Please log in.");
      window.location.href = "/login";
    } catch (error) {
      alert("Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 px-4">
      {/* Intro Panel */}
      <div className="flex-1 basis-1/3 p-6 text-center md:text-right">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-500 mb-4 animate-fade-in">
          Create an Account
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Join us and start your journey today.
        </p>
      </div>

      {/* Register Form */}
      <div className="flex basis-1/3 mr-6 max-w-sm bg-white dark:bg-slate-800 p-8 rounded-xl shadow-lg dark:shadow-none">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 max-w-sm mx-auto"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Register
          </button>

          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
            Already have an account?{" "}
            <a href="/login" className="text-green-600 hover:underline">
              Log in
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}