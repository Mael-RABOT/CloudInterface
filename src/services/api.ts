import axios from 'axios';
import * as jose from 'jose';

// Ensure VITE_ENDPOINT has a protocol
const getEndpoint = () => {
  const endpoint = import.meta.env.VITE_ENDPOINT;
  if (!endpoint) return '/api';

  // If endpoint doesn't start with http:// or https://, add http://
  if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
    return `http://${endpoint}/api`;
  }

  return `${endpoint}/api`;
};

const API_BASE_URL = getEndpoint();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT public key from environment
const JWT_PUBLIC_KEY = import.meta.env.VITE_JWT_PUB_KEY;

// Interface for user data
export interface User {
  id: number;
  username: string;
  email: string;
  roles?: string[];
}

// Interface for item data
export interface Item {
  id: number;
  location: string;
  filename: string;
  contentType: string;
  createdAt: string;
  size?: number;
  isShared?: boolean;
}

// Interface for login response
export interface LoginResponse {
  token: string;
  user: User;
}

// Interface for register response
export interface RegisterResponse {
  message: string;
  user: User;
}

// Interface for upload response
export interface UploadResponse {
  id: number;
  location: string;
  filename: string;
  contentType: string;
  createdAt: string;
}

// Interface for shared URL response
export interface SharedUrlResponse {
  shared_url: string;
  item_id: number;
  filename: string;
  content_type: string;
}

// JWT token management
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('token');
};

// Verify JWT token
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    if (!JWT_PUBLIC_KEY) {
      console.error('JWT public key not found in environment variables');
      return false;
    }

    const publicKey = await jose.importSPKI(JWT_PUBLIC_KEY, 'RS256');
    await jose.jwtVerify(token, publicKey);
    return true;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

// Add request interceptor for debugging
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  console.error("Request interceptor error:", error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    console.error("Error status:", error.response?.status);
    console.error("Error data:", error.response?.data);

    // Only redirect to login for 401 errors on authenticated requests, not login attempts
    if (error.response?.status === 401 && error.config?.url !== '/auth/login') {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Authentication API
export const authAPI = {
  // Register new user
  register: async (username: string, email: string, password: string): Promise<RegisterResponse> => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    return response.data;
  },

  // Login user
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', {
      username,
      password,
    });

    // Decode the JWT token to extract user information
    const decoded = jose.decodeJwt(response.data.token);
    if (decoded && typeof decoded === 'object') {
      const user: User = {
        id: decoded.sub ? parseInt(decoded.sub as string) : 0,
        username: decoded.username as string || username,
        email: decoded.email as string || '',
        roles: decoded.roles as string[] || [],
      };

      return {
        token: response.data.token,
        user: user
      };
    }

    throw new Error('Failed to decode JWT token');
  },
};

// Items API
export const itemsAPI = {
  // Get user's items
  getMyItems: async (): Promise<Item[]> => {
    const response = await api.get('/items');
    return response.data['hydra:member'] || response.data.member || response.data;
  },

  // Upload file
  uploadFile: async (location: string, file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('location', location);
    formData.append('content', file);

    const response = await api.post('/items/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload multiple files sequentially
  uploadFiles: async (location: string, files: File[]): Promise<UploadResponse[]> => {
    const results: UploadResponse[] = [];

    for (const file of files) {
      const result = await itemsAPI.uploadFile(location, file);
      results.push(result);
    }

    return results;
  },

  // Download file
  downloadFile: async (id: number): Promise<Blob> => {
    const response = await api.get(`/items/${id}/file`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete item
  deleteItem: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`);
  },

  // Update file content
  updateFile: async (id: number, content: string, filename: string): Promise<UploadResponse> => {
    const response = await api.put(`/items/${id}/update`, {
      content: content,
      filename: filename
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  },

  // Toggle file sharing
  toggleShared: async (id: number): Promise<void> => {
    await api.post(`/items/${id}/toggle_shared`);
  },

  // Get shared URL for file
  getSharedUrl: async (id: number): Promise<SharedUrlResponse> => {
    const response = await api.get(`/items/${id}/get_shared_url`);
    return response.data;
  },

};

export default api;