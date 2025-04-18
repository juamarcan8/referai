import axios from "axios";

export const uploadClip = async (
  file: File,
  onProgress?: (percent: number) => void
) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post("http://127.0.0.1:8080/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: false,
    onUploadProgress: (event) => {
      if (onProgress && event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress(percent);
      }
    },
  });

  return response.data.filename;
};
