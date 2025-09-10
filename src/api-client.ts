import { HttpClient } from './http-client';
import { ClientConfig, RequestOptions, ApiResponse, QueryParams, RequestBody } from './types';
import { API_ENDPOINTS, EndpointName } from './endpoints';

export class ApiClient {
  private httpClient: HttpClient;

  constructor(config: ClientConfig) {
    this.httpClient = new HttpClient(config);
  }

  /**
   * Make a request to any configured endpoint
   * This method automatically handles validation, type checking, and path parameters
   */
  async request<T extends EndpointName>(
    endpointName: T,
    options: RequestOptions = {},
    pathParams?: Record<string, string | number>
  ): Promise<ApiResponse> {
    const endpointConfig = API_ENDPOINTS[endpointName];

    if (!endpointConfig) {
      throw new Error(`Endpoint '${endpointName}' not found in configuration`);
    }

    // Handle path parameters (e.g., /users/:id -> /users/123)
    let path = endpointConfig.path;
    if (pathParams) {
      for (const [key, value] of Object.entries(pathParams)) {
        path = path.replace(`:${key}`, String(value));
      }
    }

    const configWithResolvedPath = {
      ...endpointConfig,
      path,
    };

    return this.httpClient.request(configWithResolvedPath, options);
  }

  // Convenience methods for common HTTP operations
  async get<T extends EndpointName>(
    endpointName: T,
    queryParams?: QueryParams,
    pathParams?: Record<string, string | number>
  ) {
    return this.request(endpointName, { queryParams }, pathParams);
  }

  async post<T extends EndpointName>(
    endpointName: T,
    body?: RequestBody,
    pathParams?: Record<string, string | number>
  ) {
    return this.request(endpointName, { body }, pathParams);
  }

  async put<T extends EndpointName>(
    endpointName: T,
    body?: RequestBody,
    pathParams?: Record<string, string | number>
  ) {
    return this.request(endpointName, { body }, pathParams);
  }

  async delete<T extends EndpointName>(
    endpointName: T,
    pathParams?: Record<string, string | number>
  ) {
    return this.request(endpointName, {}, pathParams);
  }

  // Typed convenience methods for specific endpoints
  // These provide full type safety and IntelliSense support

  // User operations
  async getUsers(queryParams?: { page?: number; limit?: number; search?: string }) {
    return this.get('getUsers', queryParams);
  }

  async getUserById(userId: string | number) {
    return this.get('getUserById', undefined, { id: userId });
  }

  async createUser(userData: { name: string; email: string; password: string }) {
    return this.post('createUser', userData);
  }

  async updateUser(userId: string | number, userData: { name?: string; email?: string }) {
    return this.put('updateUser', userData, { id: userId });
  }

  async deleteUser(userId: string | number) {
    return this.delete('deleteUser', { id: userId });
  }

  // Authentication operations
  async login(credentials: { email: string; password: string }) {
    return this.post('login', credentials);
  }

  async logout() {
    return this.post('logout');
  }

  // Post operations
  async getPosts(queryParams?: { authorId?: number; category?: string; published?: boolean }) {
    return this.get('getPosts', queryParams);
  }

  async getPostById(postId: string | number) {
    return this.get('getPostById', undefined, { id: postId });
  }

  async createPost(postData: {
    title: string;
    content: string;
    category: string;
    published?: boolean;
  }) {
    return this.post('createPost', postData);
  }

  async updatePost(
    postId: string | number,
    postData: { title?: string; content?: string; category?: string; published?: boolean }
  ) {
    return this.put('updatePost', postData, { id: postId });
  }

  async deletePost(postId: string | number) {
    return this.delete('deletePost', { id: postId });
  }
}
