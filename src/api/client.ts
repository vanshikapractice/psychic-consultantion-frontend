import type { RequestConfig, ApiError, ErrorCode } from "./types";

const STORAGE_KEY = "psychic_app_token";

export const STORAGE_TOKEN_KEY = STORAGE_KEY;

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export type Interceptor = (config: RequestConfig) => RequestConfig;
export type ResponseInterceptor = (response: unknown) => unknown;

class ApiClient {
  private _token: string | null = null;
  private requestInterceptors: Interceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];

  constructor() {
    this._token = localStorage.getItem(STORAGE_KEY);
  }

  setToken(token: string | null) {
    this._token = token;
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  get token(): string | null {
    return this._token;
  }

  addRequestInterceptor(fn: Interceptor) {
    this.requestInterceptors.push(fn);
  }

  addResponseInterceptor(fn: ResponseInterceptor) {
    this.responseInterceptors.push(fn);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    let body: unknown = undefined;
    if (contentType?.includes("application/json")) {
      body = await response.json();
    }

    if (!response.ok) {
      const errBody = body as { message?: string; error?: string } | undefined;
      const message = errBody?.message ?? errBody?.error ?? response.statusText;
      const errorCode =
        (errBody?.error as ErrorCode) ?? this.mapStatusToCode(response.status);
      const apiError: ApiError = new Error(message) as ApiError;
      apiError.status = response.status;
      apiError.errorCode = errorCode;
      apiError.details = errBody;
      throw apiError;
    }

    if (response.status === 204 || body === undefined) {
      return undefined as T;
    }

    return body as T;
  }

  private mapStatusToCode(status: number): ErrorCode {
    switch (status) {
      case 400:
        return "VALIDATION_ERROR";
      case 401:
        return "UNAUTHORIZED";
      case 403:
        return "FORBIDDEN";
      case 404:
        return "ROUTE_NOT_FOUND";
      case 409:
        return "CONFLICT";
      case 422:
        return "VALIDATION_ERROR";
      case 500:
        return "INTERNAL_ERROR";
      default:
        return "API_ERROR";
    }
  }

  async request<T = unknown>(config: RequestConfig): Promise<T> {
    let req = { ...config };

    for (const interceptor of this.requestInterceptors) {
      req = interceptor(req);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...req.headers,
    };

    const url = BASE_URL ? `${BASE_URL}${req.url}` : req.url;

    const fetchOptions: RequestInit = {
      method: req.method,
      headers,
      credentials: "include",
    };

    if (req.data !== undefined) {
      fetchOptions.body = JSON.stringify(req.data);
    }

    const response = await fetch(url, fetchOptions);

    let result: unknown = await this.handleResponse<T>(response);

    for (const interceptor of this.responseInterceptors) {
      result = interceptor(result);
    }

    return result as T;
  }

  get<T = unknown>(url: string, headers?: Record<string, string>) {
    return this.request<T>({ method: "GET", url, headers });
  }
  post<T = unknown>(url: string, data?: unknown, headers?: Record<string, string>) {
    return this.request<T>({ method: "POST", url, data, headers });
  }
  put<T = unknown>(url: string, data?: unknown, headers?: Record<string, string>) {
    return this.request<T>({ method: "PUT", url, data, headers });
  }
  patch<T = unknown>(url: string, data?: unknown, headers?: Record<string, string>) {
    return this.request<T>({ method: "PATCH", url, data, headers });
  }
  delete<T = unknown>(url: string, headers?: Record<string, string>) {
    return this.request<T>({ method: "DELETE", url, headers });
  }
}

export const apiClient = new ApiClient();

apiClient.addRequestInterceptor((config) => {
  if (apiClient.token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${apiClient.token}`,
    };
  }
  return config;
});

export { STORAGE_KEY };
