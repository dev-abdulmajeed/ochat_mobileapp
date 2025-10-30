import axios from "axios";
import { navigationRef } from "../services/NavigationService";
import Toast from "react-native-toast-notifications"; // ✅ FIXED import
import AsyncStorage from "@react-native-async-storage/async-storage";

// ------------------- Toast Management -------------------
const errors = new Set();

export const BASE_IMAGE_URL = "https://api.qa.osquare.solutions/";


const showToast = (key, message, options) => {
  if (errors.has(key)) return; // Prevent duplicate toasts
  errors.add(key);
  Toast.show(message, options);
  setTimeout(() => errors.delete(key), options?.duration || 4000);
};

const toast = {
  duration: 3000,
  placement: "bottom",
  animationType: "slide-in",
};

// ------------------- Axios Instance -------------------
export const osquare = axios.create({
  timeout: 0,
  baseURL: "https://api.qa.osquare.solutions/api/",
  headers: { "Content-Type": "application/json" },
});

// ------------------- Request Interceptor -------------------
osquare.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const userString = await AsyncStorage.getItem("user");
      const user = userString ? JSON.parse(userString) : {};

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (user?.companyId) config.headers.CompanyId = user.companyId;
        if (user?.workspaceId) config.headers.WorkspaceId = user.workspaceId;
      }
    } catch (error) {
      console.error("Token retrieval error:", error);
      showToast("token-error", "Error preparing request.", {
        ...toast,
        type: "danger",
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ------------------- Token Refresh Logic -------------------
let failedQueue = [];
let isRefreshing = false;

const processQueue = (error = null, token = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token)));
  failedQueue = [];
};

// ------------------- Response Interceptor -------------------
osquare.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error;

    if (!config) return Promise.reject(error);

    // ✅ Handle 401 token refresh
    if (response?.status === 401 && !config._retry) {
      if (isRefreshing) {
        // Queue other requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            config.headers.Authorization = `Bearer ${token}`;
            return osquare(config);
          })
          .catch((err) => Promise.reject(err));
      }

      config._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshToken();
        processQueue(null, newToken);
        config.headers.Authorization = `Bearer ${newToken}`;
        return osquare(config);
      } catch (err) {
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // ✅ Error Handling for other status codes
    if (response) {
      const { status, data } = response;
      const msg = data?.message || "An unexpected error occurred.";

      switch (status) {
        case 400:
          showToast("bad-request", msg || "Bad request.", { ...toast, type: "warning" });
          break;
        case 403:
          showToast("forbidden", "Access denied. You do not have permission.", { ...toast, type: "danger" });
          break;
        case 404:
          showToast("not-found", "The requested resource was not found.", { ...toast, type: "warning" });
          break;
        case 408:
          showToast("timeout", "Request timeout. Please try again.", { ...toast, type: "warning" });
          break;
        case 429:
          showToast("too-many-requests", "Too many requests. Please slow down.", { ...toast, type: "warning" });
          break;
        case 500:
          showToast("server-error", "Server error. Please try again later.", { ...toast, type: "danger" });
          break;
        case 503:
          showToast("service-unavailable", "Service temporarily unavailable.", { ...toast, type: "danger" });
          break;
        default:
          showToast(`error-${status}`, msg, { ...toast, type: "danger" });
          break;
      }
    } else if (error.request) {
      showToast("network-error", "Please check your internet connection.", {
        ...toast,
        type: "danger",
      });
    } else {
      showToast("general-error", error.message || "Something went wrong.", {
        ...toast,
        type: "danger",
      });
    }

    return Promise.reject(error);
  }
);

// ------------------- Refresh Token Function -------------------
const refreshToken = async () => {
  try {
    const storedRefreshToken = await AsyncStorage.getItem("refreshToken");
    if (!storedRefreshToken) throw new Error("No refresh token found");

    const encodedToken = encodeURIComponent(storedRefreshToken);
    const osquareUrl = "https://api.qa.osquare.solutions";

    const { data } = await axios.post(
      `${osquareUrl}/api/User/refresh-token?refreshToken=${encodedToken}`
    );

    const { accessToken, refreshToken: newRefreshToken } = data;

    await AsyncStorage.setItem("token", accessToken);
    await AsyncStorage.setItem("refreshToken", newRefreshToken);

    return accessToken;
  } catch (error) {
    if (error?.response?.status === 401) {
      await AsyncStorage.clear();
      navigationRef.replace("login");
      showToast("unauthorized", "Session expired. Please log in again.", {
        ...toast,
        type: "warning",
      });
    }
    throw error;
  }
};
