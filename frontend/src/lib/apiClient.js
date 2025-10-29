export const normalizeBaseUrl = (value, fallback = "/api") => {
	if (typeof value !== "string") {
		return fallback;
	}

	const trimmed = value.trim();

	if (!trimmed) {
		return fallback;
	}

	const normalized = trimmed.replace(/\/+$/, "");

	return normalized || fallback;
};

const readEnvBaseUrl = () => {
	try {
		const meta = typeof import.meta !== "undefined" ? import.meta : undefined;
		const envValue = meta?.env?.VITE_API_BASE_URL;
		return normalizeBaseUrl(envValue);
	} catch (error) {
		console.warn(
			"[apiClient] Unable to resolve VITE_API_BASE_URL, using fallback '/api'",
			error
		);
		return "/api";
	}
};

const API_BASE_URL = readEnvBaseUrl();

let refreshHandler = null;
let logoutHandler = null;
let refreshPromise = null;

const parseJsonSafe = async (response) => {
        try {
                return await response.json();
        } catch {
                return null;
        }
};

const buildFetchConfig = ({ method = "GET", body, headers, ...restOptions }) => {
        const fetchHeaders = new Headers(headers || {});
        const config = {
                method,
                credentials: "include",
                headers: fetchHeaders,
                ...restOptions,
        };

        if (body !== undefined) {
                if (body instanceof FormData) {
                        config.body = body;
                } else if (typeof body === "string" || body instanceof Blob) {
                        config.body = body;
                } else {
                        if (!fetchHeaders.has("Content-Type")) {
                                fetchHeaders.set("Content-Type", "application/json");
                        }
                        config.body = JSON.stringify(body);
                }
        }

        return config;
};

const resolveEndpoint = (endpoint) => {
        if (/^https?:/i.test(endpoint)) {
                return endpoint;
        }

        if (endpoint.startsWith("/")) {
                return `${API_BASE_URL}${endpoint}`;
        }

        return `${API_BASE_URL}/${endpoint}`;
};

const request = async (endpoint, options = {}) => {
	const {
		skipAuthRetry = false,
		suppressError = false,
		errorFallback = null,
		onError,
		...restOptions
	} = options;

	try {
		const config = buildFetchConfig(restOptions);
		const response = await fetch(resolveEndpoint(endpoint), config);

		if (
			response.status === 401 &&
			!skipAuthRetry &&
			typeof refreshHandler === "function"
		) {
			try {
				if (!refreshPromise) {
					refreshPromise = refreshHandler();
				}
				await refreshPromise;
				refreshPromise = null;
				return request(endpoint, { ...options, skipAuthRetry: true });
			} catch (error) {
				refreshPromise = null;
				if (typeof logoutHandler === "function") {
					logoutHandler();
				}
				throw error;
			}
		}

		if (!response.ok) {
			const errorData = await parseJsonSafe(response);
			const error = new Error(
				errorData?.message || `Request failed with status ${response.status}`
			);
			error.response = {
				status: response.status,
				data: errorData,
			};
			throw error;
		}

		return await parseJsonSafe(response);
	} catch (error) {
		console.error(
			`[apiClient] Request to ${endpoint} failed: ${error.message}`,
			error
		);
		if (typeof onError === "function") {
			try {
				onError(error);
			} catch (handlerError) {
				console.error("[apiClient] onError handler threw", handlerError);
			}
		}
		if (suppressError) {
			return typeof errorFallback === "function"
				? errorFallback(error)
				: errorFallback;
		}
		throw error;
	}
};

export const apiClient = {
        get: (endpoint, config) => request(endpoint, { ...config, method: "GET" }),
        post: (endpoint, body, config) => request(endpoint, { ...config, method: "POST", body }),
        put: (endpoint, body, config) => request(endpoint, { ...config, method: "PUT", body }),
        patch: (endpoint, body, config) => request(endpoint, { ...config, method: "PATCH", body }),
        delete: (endpoint, config) => request(endpoint, { ...config, method: "DELETE" }),
};

export const registerAuthHandlers = ({ onRefresh, onLogout }) => {
        refreshHandler = onRefresh;
        logoutHandler = onLogout;
};

export default apiClient;
