// Main entry point for the API wrapper package
export { ApiClient } from './api-client';
export { HttpClient } from './http-client';
export { API_ENDPOINTS } from './endpoints';
export { Validator } from './validator';

// Export all types for consumers
export type {
  HttpMethod,
  QueryParams,
  RequestBody,
  Headers,
  ApiResponse,
  EndpointConfig,
  ClientConfig,
  RequestOptions,
  ValidationError,
} from './types';

export { ApiValidationError, ApiRequestError } from './types';

// Export endpoint-specific types
export type {
  UserQueryParams,
  UserResponse,
  CreateUserBody,
  UpdateUserBody,
  LoginBody,
  LoginResponse,
  PostQueryParams,
  PostResponse,
  CreatePostBody,
  EndpointName,
} from './endpoints';

import { ApiClient } from './api-client';
import type { Headers } from './types';

// Factory function for creating API client instances
export function createApiClient(config: {
  baseURL: string;
  defaultHeaders?: Headers;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}) {
  return new ApiClient(config);
}

// Default export
export default ApiClient;
