/**
 * apiClient.js
 *
 * Centralised HTTP client for the حِرفة marketplace API.
 *
 * - Base URL comes from the environment variable VITE_API_BASE_URL.
 * - Every request sends Accept: application/json.
 * - Both HTTP-level errors (non-2xx) and application-level errors
 *   (status === "Error") are thrown as Error instances.
 * - AbortSignal is threaded through so callers can cancel requests
 *   cleanly in useEffect cleanup functions.
 */

const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/v1"
).replace(/\/+$/, "");

/**
 * Internal helper: builds and sends a JSON request.
 *
 * @param {string} method   HTTP verb
 * @param {string} path     API path starting with /
 * @param {object} [body]   Request body (JSON-serialisable)
 * @param {AbortSignal} [signal]  Optional abort signal
 * @param {string} [token]  Optional Bearer token
 * @returns {Promise<*>}    Resolved data from the API response
 */
async function request(method, path, { body, signal, token } = {}) {
  const headers = { Accept: "application/json" };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  // Parse JSON defensively — some endpoints may return empty bodies.
  const result = await response.json().catch(() => ({}));

  // HTTP-level failure
  if (!response.ok) {
    const message =
      result?.message ||
      result?.error ||
      `Request failed (${response.status})`;
    const error = new Error(message);
    error.status = response.status;
    error.data = result;
    throw error;
  }

  // Application-level failure (Laravel custom error envelope)
  if (result?.status === "Error") {
    throw new Error(result.message || "حدث خطأ أثناء معالجة الطلب.");
  }

  // Unwrap the data envelope if present
  return result?.data ?? result;
}

// ── Public shorthand methods ──────────────────────────────────

export const apiClient = {
  /**
   * GET request.
   * @param {string} path
   * @param {{ signal?: AbortSignal, token?: string }} [options]
   */
  get(path, options = {}) {
    return request("GET", path, options);
  },

  /**
   * POST request.
   * @param {string} path
   * @param {object} body
   * @param {{ signal?: AbortSignal, token?: string }} [options]
   */
  post(path, body, options = {}) {
    return request("POST", path, { ...options, body });
  },

  /**
   * PUT request.
   * @param {string} path
   * @param {object} body
   * @param {{ signal?: AbortSignal, token?: string }} [options]
   */
  put(path, body, options = {}) {
    return request("PUT", path, { ...options, body });
  },

  /**
   * DELETE request.
   * @param {string} path
   * @param {{ signal?: AbortSignal, token?: string }} [options]
   */
  delete(path, options = {}) {
    return request("DELETE", path, options);
  },

  /** Expose base URL for display in error panels */
  baseUrl: API_BASE,
};
