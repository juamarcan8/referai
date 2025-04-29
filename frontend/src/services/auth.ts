const API_URL = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string) {
  console.log("Sending login", email, password);
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  console.log("Response data:", data);

  if (!res.ok) throw new Error("Login failed");
  return data;
}

export async function register(email: string, password: string) {
  console.log("Sending registration", email, password);
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, confirm_password: password }),
  });
  const data = await res.json();

  if (!res.ok) {
    console.error("Registration error:", data);
    throw new Error(data.detail || "Registration failed");
  }
  return data;
}
