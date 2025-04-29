const API_URL = import.meta.env.VITE_API_URL;

export async function uploadClips(files: File[], token: string, actionId?: number) {
  const formData = new FormData();
  files.forEach(file => formData.append("files", file));
  if (actionId) formData.append("action_id", actionId.toString());

  const response = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: {
          Authorization: `Bearer ${token}`,
      },
      body: formData,
  });

  if (!response.ok) throw new Error("Upload failed");
  return await response.json(); // will contain action_id
}

