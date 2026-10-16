import axios from "axios";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api/v1",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;

let refreshPromise: Promise<void> | null =
  null;

const refreshAccessToken = async () => {
  await api.post("/auth/refresh");
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest =
      error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest?._retry
    ) {
      return Promise.reject(error);
    }

    if (
      originalRequest?.url?.includes(
        "/auth/login"
      ) ||
      originalRequest?.url?.includes(
        "/auth/register"
      ) ||
      originalRequest?.url?.includes(
        "/auth/refresh"
      ) ||
      originalRequest?.url?.includes(
        "/auth/logout"
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise =
          refreshAccessToken().finally(
            () => {
              isRefreshing = false;
              refreshPromise = null;
            }
          );
      }

      await refreshPromise;

      return api(originalRequest);
    } catch (refreshError) {
      return Promise.reject(
        refreshError
      );
    }
  }
);