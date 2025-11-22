import axios from "axios";

// Production API URL - این مقدار پیش‌فرض است
const PRODUCTION_API_URL = "https://tender-mendel-6y7weckrv.liara.run/api";
const DEVELOPMENT_API_URL = "http://localhost:5000/api";

// Check if we're in development mode
const isDevelopment =
  import.meta.env.DEV || import.meta.env.MODE === "development";

// Get API URL - prioritize runtime config, then build-time env, then default
const getApiUrl = (): string => {
  // In development, use localhost
  if (isDevelopment) {
    const devUrl = import.meta.env.VITE_API_URL || DEVELOPMENT_API_URL;
    return devUrl;
  }

  // First try build-time env variable (but never use localhost in production)
  const buildTimeUrl = import.meta.env.VITE_API_URL;
  if (buildTimeUrl && !buildTimeUrl.includes("localhost")) {
    return buildTimeUrl;
  }

  // Always default to production API URL (never localhost)
  return PRODUCTION_API_URL;
};

// Create axios instance with initial URL
const apiClient = axios.create({
  baseURL: getApiUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

// Log initial API URL
console.log("Initial API URL:", apiClient.defaults.baseURL);

// Try to load runtime config and update baseURL if available
if (typeof window !== "undefined") {
  // Load config synchronously before any requests
  fetch("/config.json")
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error("Config not found");
    })
    .then((config) => {
      if (config?.VITE_API_URL) {
        // In development, allow localhost
        if (isDevelopment || !config.VITE_API_URL.includes("localhost")) {
          apiClient.defaults.baseURL = config.VITE_API_URL;
          console.log(
            "✅ API URL loaded from config.json:",
            config.VITE_API_URL
          );
        } else {
          console.warn(
            "⚠️ Config contains localhost in production, using production URL instead"
          );
          apiClient.defaults.baseURL = PRODUCTION_API_URL;
        }
      } else {
        console.log("Using default API URL:", apiClient.defaults.baseURL);
      }
    })
    .catch((error) => {
      // Config file doesn't exist or failed to load, use default
      console.log("Using default API URL:", apiClient.defaults.baseURL);
      console.warn("Failed to load config.json:", error);
    });
}

// Request interceptor to add token and prevent localhost requests
apiClient.interceptors.request.use(
  (config) => {
    // Prevent any requests to localhost
    const fullUrl = config.url || "";
    const baseURL = config.baseURL || apiClient.defaults.baseURL || "";
    const fullRequestUrl = baseURL + fullUrl;

    // Only block localhost in production
    if (
      !isDevelopment &&
      (fullRequestUrl.includes("localhost") ||
        fullRequestUrl.includes("127.0.0.1"))
    ) {
      console.error(
        "❌ Blocked request to localhost in production:",
        fullRequestUrl
      );
      console.log("Using production URL instead:", PRODUCTION_API_URL);
      config.baseURL = PRODUCTION_API_URL;
    }

    // Add token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request URL for debugging
    const requestUrl =
      (config.baseURL || apiClient.defaults.baseURL || "") + (config.url || "");
    console.log("📡 API Request:", config.method?.toUpperCase(), requestUrl);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we have a token (user was logged in)
      // Don't redirect on login page when credentials are wrong
      const hasToken = localStorage.getItem("token");
      const isLoginRequest = error.config?.url?.includes("/auth/login");

      if (hasToken && !isLoginRequest) {
        // Clear token and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("support-user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
