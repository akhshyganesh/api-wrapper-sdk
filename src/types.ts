// Core type definitions for the API wrapper

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface QueryParams {
  [key: string]: string | number | boolean | undefined;
}

export interface RequestBody {
  [key: string]: unknown;
}

export interface Headers {
  [key: string]: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface EndpointConfig<
  TQueryParams = QueryParams,
  TRequestBody = RequestBody,
> {
  path: string;
  method: HttpMethod;
  queryParams?: {
    [K in keyof TQueryParams]: {
      required?: boolean;
      type: 'string' | 'number' | 'boolean';
      description?: string;
    };
  };
  requestBody?: {
    [K in keyof TRequestBody]: {
      required?: boolean;
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      description?: string;
    };
  };
  headers?: Headers;
  timeout?: number;
  description?: string;
}

export interface ClientConfig {
  baseURL: string;
  defaultHeaders?: Headers;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

export interface RequestOptions<TQueryParams = QueryParams, TRequestBody = RequestBody> {
  queryParams?: TQueryParams;
  body?: TRequestBody;
  headers?: Headers;
  timeout?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  expectedType: string;
  actualValue: unknown;
}

export class ApiValidationError extends Error {
  public errors: ValidationError[];

  constructor(errors: ValidationError[]) {
    const message = `Validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join(', ')}`;
    super(message);
    this.name = 'ApiValidationError';
    this.errors = errors;
  }
}

export class ApiRequestError extends Error {
  public status?: number;
  public statusText?: string;
  public response?: unknown;

  constructor(message: string, status?: number, statusText?: string, response?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}
