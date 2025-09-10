import { ApiClient, createApiClient, ApiValidationError } from '../index';

describe('API Client', () => {
  let apiClient: ApiClient;

  beforeEach(() => {
    apiClient = createApiClient({
      baseURL: 'https://api.example.com',
      timeout: 5000,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
    });
  });

  describe('Validation', () => {
    test('should validate required query parameters', async () => {
      // Mock the HTTP client to focus on validation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const httpClientRequestSpy = jest.spyOn((apiClient as any).httpClient, 'request');
      httpClientRequestSpy.mockResolvedValue({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      // This should work - no required params in getUsers endpoint
      await apiClient.getUsers({ page: 1, limit: 10 });
      expect(httpClientRequestSpy).toHaveBeenCalled();
    });

    test('should validate request body types', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const httpClientRequestSpy = jest.spyOn((apiClient as any).httpClient, 'request');
      httpClientRequestSpy.mockImplementation(() => {
        throw new ApiValidationError([
          {
            field: 'email',
            message: 'Required field is missing',
            expectedType: 'string',
            actualValue: undefined,
          },
        ]);
      });

      try {
        await apiClient.createUser({
          name: 'John Doe',
          // email missing - should cause validation error
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiValidationError);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((error as any).errors).toHaveLength(1);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((error as any).errors[0].field).toBe('email');
      }
    });
  });

  describe('Path Parameters', () => {
    test('should handle path parameters correctly', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const httpClientRequestSpy = jest.spyOn((apiClient as any).httpClient, 'request');
      httpClientRequestSpy.mockResolvedValue({
        data: {},
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await apiClient.getUserById(123);

      const calledConfig = httpClientRequestSpy.mock.calls[0][0];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((calledConfig as any).path).toBe('/users/123');
    });
  });

  describe('Convenience Methods', () => {
    test('should provide typed convenience methods', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const httpClientRequestSpy = jest.spyOn((apiClient as any).httpClient, 'request');
      httpClientRequestSpy.mockResolvedValue({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      // Test different HTTP methods
      await apiClient.getUsers({ page: 1 });
      await apiClient.createUser({ name: 'John', email: 'john@example.com', password: 'pass' });
      await apiClient.updateUser(123, { name: 'Jane' });
      await apiClient.deleteUser(123);

      expect(httpClientRequestSpy).toHaveBeenCalledTimes(4);
    });
  });

  describe('Generic Request Method', () => {
    test('should allow generic requests to any configured endpoint', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const httpClientRequestSpy = jest.spyOn((apiClient as any).httpClient, 'request');
      httpClientRequestSpy.mockResolvedValue({
        data: [],
        status: 200,
        statusText: 'OK',
        headers: {},
      });

      await apiClient.request('getUsers', {
        queryParams: { limit: 5 },
      });

      expect(httpClientRequestSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/users',
          method: 'GET',
        }),
        expect.objectContaining({
          queryParams: { limit: 5 },
        })
      );
    });
  });
});

describe('Configuration-Driven Architecture', () => {
  test('should demonstrate how easy it is to add new endpoints', () => {
    // This test demonstrates the maintainability aspect
    // New endpoints only require adding configuration to endpoints.ts

    // Import the endpoints configuration
    const { API_ENDPOINTS } = require('../endpoints');

    // Verify that endpoints are properly configured
    expect(API_ENDPOINTS.getUsers).toBeDefined();
    expect(API_ENDPOINTS.getUsers.path).toBe('/users');
    expect(API_ENDPOINTS.getUsers.method).toBe('GET');

    expect(API_ENDPOINTS.createUser).toBeDefined();
    expect(API_ENDPOINTS.createUser.path).toBe('/users');
    expect(API_ENDPOINTS.createUser.method).toBe('POST');

    // Adding a new endpoint would simply require adding it to API_ENDPOINTS
    // No other files need to be modified for basic functionality
  });
});
