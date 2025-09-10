import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  ClientConfig,
  EndpointConfig,
  RequestOptions,
  ApiResponse,
  ApiRequestError,
  ApiValidationError,
  QueryParams,
  RequestBody,
} from './types';
import { Validator } from './validator';

export class HttpClient {
  private client: AxiosInstance;
  private config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: config.defaultHeaders || {},
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] Response ${response.status} for ${response.config.url}`);
        return response;
      },
      async (error) => {
        if (this.config.retries && error.config && !error.config.__retryCount) {
          error.config.__retryCount = 0;
        }

        if (
          this.config.retries &&
          error.config &&
          error.config.__retryCount < this.config.retries &&
          this.shouldRetry(error)
        ) {
          error.config.__retryCount++;
          console.log(
            `[API] Retrying request (${error.config.__retryCount}/${this.config.retries})`
          );

          if (this.config.retryDelay) {
            await this.delay(this.config.retryDelay);
          }

          return this.client(error.config);
        }

        return Promise.reject(error);
      }
    );
  }

  private shouldRetry(error: unknown): boolean {
    // Retry on network errors and 5xx status codes
    return (
      !error ||
      typeof error !== 'object' ||
      !('response' in error) ||
      !error.response ||
      (typeof error.response === 'object' &&
        error.response &&
        'status' in error.response &&
        typeof error.response.status === 'number' &&
        error.response.status >= 500 &&
        error.response.status < 600)
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async request<TQueryParams = QueryParams, TRequestBody = RequestBody, TResponse = unknown>(
    endpointConfig: EndpointConfig<TQueryParams, TRequestBody>,
    options: RequestOptions<TQueryParams, TRequestBody> = {}
  ): Promise<ApiResponse<TResponse>> {
    try {
      // Validate query parameters
      if (options.queryParams && endpointConfig.queryParams) {
        const queryErrors = Validator.validateQueryParams(
          options.queryParams as QueryParams,
          endpointConfig.queryParams
        );
        if (queryErrors.length > 0) {
          throw new ApiValidationError(queryErrors);
        }
      }

      // Validate request body
      if (options.body && endpointConfig.requestBody) {
        const bodyErrors = Validator.validateRequestBody(
          options.body as RequestBody,
          endpointConfig.requestBody
        );
        if (bodyErrors.length > 0) {
          throw new ApiValidationError(bodyErrors);
        }
      }

      // Prepare request configuration
      const requestConfig = {
        method: endpointConfig.method,
        url: endpointConfig.path,
        params: options.queryParams,
        data: options.body,
        headers: {
          ...endpointConfig.headers,
          ...options.headers,
        },
        timeout: options.timeout || endpointConfig.timeout,
      };

      // Make the request
      const response: AxiosResponse<TResponse> = await this.client(requestConfig);

      return {
        data: response.data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers as Record<string, string>,
      };
    } catch (error: unknown) {
      if (error instanceof ApiValidationError) {
        throw error;
      }

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response: { status: number; statusText: string; data: unknown };
          message: string;
        };
        throw new ApiRequestError(
          `Request failed: ${axiosError.message}`,
          axiosError.response.status,
          axiosError.response.statusText,
          axiosError.response.data
        );
      } else if (error && typeof error === 'object' && 'request' in error) {
        const requestError = error as unknown as { message: string };
        throw new ApiRequestError(`Network error: ${requestError.message}`);
      } else {
        const generalError = error as unknown as { message: string };
        throw new ApiRequestError(`Request setup error: ${generalError.message}`);
      }
    }
  }
}
