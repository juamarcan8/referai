const API_URL = import.meta.env.VITE_API_URL;

export async function getLastAction(token: string) {
    const response = await fetch(`${API_URL}/action/last`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    if (!response.ok) {
      throw new Error("Failed to fetch the last action");
    }
  
    return await response.json();
  }