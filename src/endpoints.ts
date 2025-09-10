import { EndpointConfig, HttpMethod } from './types';

// This is the ONLY file you need to modify when adding new endpoints!
// Just add your endpoint configuration here and the library will handle everything else.

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserBody {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserBody {
  name?: string;
  email?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserResponse;
  expiresAt: string;
}

export interface PostQueryParams {
  authorId?: number;
  category?: string;
  published?: boolean;
}

export interface PostResponse {
  id: number;
  title: string;
  content: string;
  authorId: number;
  category: string;
  published: boolean;
  createdAt: string;
}

export interface CreatePostBody {
  title: string;
  content: string;
  category: string;
  published?: boolean;
}

// ENDPOINT CONFIGURATIONS
// Add new endpoints here - this is the ONLY place you need to make changes!
export const API_ENDPOINTS = {
  // User endpoints
  getUsers: {
    path: '/users',
    method: 'GET' as HttpMethod,
    queryParams: {
      page: { type: 'number', description: 'Page number for pagination' },
      limit: { type: 'number', description: 'Number of items per page' },
      search: { type: 'string', description: 'Search term for filtering users' },
    },
    description: 'Get a list of users with optional filtering and pagination',
  } as EndpointConfig<UserQueryParams, never>,

  getUserById: {
    path: '/users/:id',
    method: 'GET' as HttpMethod,
    description: 'Get a specific user by ID',
  } as EndpointConfig<never, never>,

  createUser: {
    path: '/users',
    method: 'POST' as HttpMethod,
    requestBody: {
      name: { required: true, type: 'string', description: 'User name' },
      email: { required: true, type: 'string', description: 'User email' },
      password: { required: true, type: 'string', description: 'User password' },
    },
    description: 'Create a new user',
  } as EndpointConfig<never, CreateUserBody>,

  updateUser: {
    path: '/users/:id',
    method: 'PUT' as HttpMethod,
    requestBody: {
      name: { type: 'string', description: 'Updated user name' },
      email: { type: 'string', description: 'Updated user email' },
    },
    description: 'Update an existing user',
  } as EndpointConfig<never, UpdateUserBody>,

  deleteUser: {
    path: '/users/:id',
    method: 'DELETE' as HttpMethod,
    description: 'Delete a user',
  } as EndpointConfig<never, never>,

  // Authentication endpoints
  login: {
    path: '/auth/login',
    method: 'POST' as HttpMethod,
    requestBody: {
      email: { required: true, type: 'string', description: 'User email' },
      password: { required: true, type: 'string', description: 'User password' },
    },
    description: 'Authenticate user and get access token',
  } as EndpointConfig<never, LoginBody>,

  logout: {
    path: '/auth/logout',
    method: 'POST' as HttpMethod,
    description: 'Logout user and invalidate token',
  } as EndpointConfig<never, never>,

  // Post endpoints
  getPosts: {
    path: '/posts',
    method: 'GET' as HttpMethod,
    queryParams: {
      authorId: { type: 'number', description: 'Filter by author ID' },
      category: { type: 'string', description: 'Filter by category' },
      published: { type: 'boolean', description: 'Filter by published status' },
    },
    description: 'Get a list of posts with optional filtering',
  } as EndpointConfig<PostQueryParams, never>,

  getPostById: {
    path: '/posts/:id',
    method: 'GET' as HttpMethod,
    description: 'Get a specific post by ID',
  } as EndpointConfig<never, never>,

  createPost: {
    path: '/posts',
    method: 'POST' as HttpMethod,
    requestBody: {
      title: { required: true, type: 'string', description: 'Post title' },
      content: { required: true, type: 'string', description: 'Post content' },
      category: { required: true, type: 'string', description: 'Post category' },
      published: { type: 'boolean', description: 'Publication status' },
    },
    description: 'Create a new post',
  } as EndpointConfig<never, CreatePostBody>,

  updatePost: {
    path: '/posts/:id',
    method: 'PUT' as HttpMethod,
    requestBody: {
      title: { type: 'string', description: 'Updated post title' },
      content: { type: 'string', description: 'Updated post content' },
      category: { type: 'string', description: 'Updated post category' },
      published: { type: 'boolean', description: 'Updated publication status' },
    },
    description: 'Update an existing post',
  } as EndpointConfig<never, Partial<CreatePostBody>>,

  deletePost: {
    path: '/posts/:id',
    method: 'DELETE' as HttpMethod,
    description: 'Delete a post',
  } as EndpointConfig<never, never>,
} as const;

// Type helper to extract endpoint names
export type EndpointName = keyof typeof API_ENDPOINTS;
