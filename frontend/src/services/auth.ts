const API_URL = import.meta.env.VITE_API_URL;

export async function login(email: string, password: string) {
  console.log("Sending login", email, password); // Imprime las credenciales
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  console.log("Response data:", data);  // Muestra la respuesta que llega del backend

  if (!res.ok) throw new Error("Login failed");
  return data;
}
