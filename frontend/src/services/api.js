import axios from "axios";

function normalizeApiBaseUrl(value) {
  return String(value || "").trim().replace(/\/+$/, "");
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL);

const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  if (!API_BASE_URL) {
    return Promise.reject(new Error("VITE_API_URL is not configured."));
  }

  return config;
});

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getApiErrorMessage(error) {
  if (error.message === "VITE_API_URL is not configured.") {
    return "CloudVault API URL is not configured. Set VITE_API_URL and rebuild the frontend.";
  }

  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ECONNABORTED") {
    return "The request timed out. Please try again.";
  }

  if (error.message === "Network Error") {
    return "Unable to reach the CloudVault API.";
  }

  return error.message || "Something went wrong.";
}

function readFileAsBase64(file, onProgress) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.onload = () => {
      const result = String(reader.result || "");
      const contentBase64 = result.includes(",") ? result.split(",")[1] : result;
      resolve(contentBase64);
    };
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 35));
      }
    };

    reader.readAsDataURL(file);
  });
}

export async function fetchFiles() {
  const { data } = await client.get("/files");
  return Array.isArray(data?.files) ? data.files : [];
}

export async function uploadFile(file, onProgress) {
  onProgress?.(5);
  const contentBase64 = await readFileAsBase64(file, onProgress);
  onProgress?.(40);

  const { data } = await client.post(
    "/files/upload",
    {
      file_name: file.name,
      file_type: file.type || "application/octet-stream",
      content_base64: contentBase64,
    },
    {
      onUploadProgress: (progressEvent) => {
        if (!progressEvent.total) {
          return;
        }

        const uploadPercent = Math.round(
          (progressEvent.loaded / progressEvent.total) * 55,
        );
        onProgress?.(40 + uploadPercent);
      },
    },
  );

  onProgress?.(100);
  return data?.file;
}

export async function getDownloadUrl(fileId) {
  const { data } = await client.get(`/files/${encodeURIComponent(fileId)}/download`);
  return data?.download_url;
}

export async function deleteFile(fileId) {
  await client.delete(`/files/${encodeURIComponent(fileId)}`);
}
