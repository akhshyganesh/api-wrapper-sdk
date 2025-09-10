import { ApiClient, createApiClient } from '../src/index';

// Example usage of the API wrapper

async function examples() {
  // Create API client instance
  const apiClient = createApiClient({
    baseURL: 'http://localhost:3001/api',
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    defaultHeaders: {
      'Authorization': 'Bearer your-token-here',
      'Content-Type': 'application/json'
    }
  });

  try {
    // Example 1: Get users with pagination and search
    console.log('=== Getting Users ===');
    const usersResponse = await apiClient.getUsers({
      page: 1,
      limit: 10,
      search: 'john'
    });
    console.log('Users:', usersResponse.data);

    // Example 2: Get specific user by ID
    console.log('=== Getting User by ID ===');
    const userResponse = await apiClient.getUserById(123);
    console.log('User:', userResponse.data);

    // Example 3: Create a new user
    console.log('=== Creating User ===');
    const newUserResponse = await apiClient.createUser({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepassword123'
    });
    console.log('Created User:', newUserResponse.data);

    // Example 4: Update user
    console.log('=== Updating User ===');
    const updateResponse = await apiClient.updateUser(123, {
      name: 'John Updated',
      email: 'john.updated@example.com'
    });
    console.log('Updated User:', updateResponse.data);

    // Example 5: Login
    console.log('=== User Login ===');
    const loginResponse = await apiClient.login({
      email: 'john@example.com',
      password: 'securepassword123'
    });
    console.log('Login successful:', loginResponse.data);

    // Example 6: Get posts with filtering
    console.log('=== Getting Posts ===');
    const postsResponse = await apiClient.getPosts({
      authorId: 123,
      category: 'technology',
      published: true
    });
    console.log('Posts:', postsResponse.data);

    // Example 7: Create a post
    console.log('=== Creating Post ===');
    const postResponse = await apiClient.createPost({
      title: 'My First Post',
      content: 'This is the content of my first post.',
      category: 'technology',
      published: true
    });
    console.log('Created Post:', postResponse.data);

    // Example 8: Using generic request method for custom operations
    console.log('=== Generic Request ===');
    const genericResponse = await apiClient.request('getUsers', {
      queryParams: { limit: 5 }
    });
    console.log('Generic response:', genericResponse.data);

  } catch (error) {
    console.error('API Error:', error);
    
    // Handle different types of errors
    if (error.name === 'ApiValidationError') {
      console.error('Validation errors:', error.errors);
    } else if (error.name === 'ApiRequestError') {
      console.error('Request failed:', {
        status: error.status,
        statusText: error.statusText,
        response: error.response
      });
    }
  }
}

// Example of extending the client for specific business logic
class ExtendedApiClient extends ApiClient {
  // Add business-specific methods
  async getUserWithPosts(userId: number) {
    const [userResponse, postsResponse] = await Promise.all([
      this.getUserById(userId),
      this.getPosts({ authorId: userId })
    ]);

    return {
      user: userResponse.data,
      posts: postsResponse.data
    };
  }

  async createUserWithWelcomePost(userData: { name: string; email: string; password: string }) {
    // Create user first
    const userResponse = await this.createUser(userData);

    // Create welcome post
    const postResponse = await this.createPost({
      title: `Welcome ${userData.name}!`,
      content: 'Welcome to our platform! We\'re excited to have you here.',
      category: 'welcome',
      published: true
    });

    return {
      user: userResponse.data,
      welcomePost: postResponse.data
    };
  }
}

// Run examples (uncomment to test)
// examples();

export { examples, ExtendedApiClient };
