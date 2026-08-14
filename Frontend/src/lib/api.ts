import { ApiResponse, UserProfileRequest, UserProfileResponse } from '../types/profile';
import { ProductRequest, ProductResponse } from '../types/product';
import {
  getClientUserId,
  getProfileFromStorage,
  saveProfileToStorage,
  getProductsFromStorage,
  saveProductsToStorage,
} from './storage';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8080';

async function fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const userId = getClientUserId();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-User-Id': userId,
    ...(options.headers || {}),
  };

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error: ${response.status} ${response.statusText}`;
    try {
      const errorJson: ApiResponse<unknown> = await response.json();
      if (errorJson.error?.message) {
        errorMsg = errorJson.error.message;
      }
    } catch {
      // ignore json parse error
    }
    throw new Error(errorMsg);
  }

  // 204 No Content for DELETE
  if (response.status === 204) {
    return {} as T;
  }

  const json: ApiResponse<T> = await response.json();
  if (json.error) {
    throw new Error(json.error.message || 'API request failed');
  }
  return json.data as T;
}

/**
 * Fetch profile from backend with local storage fallback.
 */
export async function getProfile(): Promise<UserProfileResponse> {
  try {
    const data = await fetchWithAuth<UserProfileResponse>('/api/profile', {
      method: 'GET',
    });
    if (data) {
      saveProfileToStorage(data);
      return data;
    }
  } catch (err) {
    console.warn('API getProfile failed, using localStorage fallback if available:', err);
  }

  const cached = getProfileFromStorage();
  if (cached) {
    return cached;
  }

  return {
    skinType: null,
    outingPatternType: null,
    outingStartTime: null,
    outingEndTime: null,
    preferredNotificationTime: null,
    baseRoutineItems: [],
    onboardingCompleted: false,
  };
}

/**
 * Save / Upsert user profile.
 */
export async function saveProfile(request: UserProfileRequest): Promise<UserProfileResponse> {
  saveProfileToStorage(request);

  try {
    const data = await fetchWithAuth<UserProfileResponse>('/api/profile', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (data) {
      saveProfileToStorage(data);
      return data;
    }
  } catch (err) {
    console.warn('API saveProfile failed, persisting locally:', err);
  }

  return {
    ...request,
    outingStartTime: request.outingStartTime || null,
    outingEndTime: request.outingEndTime || null,
    preferredNotificationTime: request.preferredNotificationTime || null,
    onboardingCompleted: true,
  };
}

/**
 * Update user profile.
 */
export async function updateProfile(request: UserProfileRequest): Promise<UserProfileResponse> {
  saveProfileToStorage(request);

  try {
    const data = await fetchWithAuth<UserProfileResponse>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(request),
    });
    if (data) {
      saveProfileToStorage(data);
      return data;
    }
  } catch (err) {
    console.warn('API updateProfile failed, persisting locally:', err);
  }

  return {
    ...request,
    outingStartTime: request.outingStartTime || null,
    outingEndTime: request.outingEndTime || null,
    preferredNotificationTime: request.preferredNotificationTime || null,
    onboardingCompleted: true,
  };
}

/* =========================================================================
 * Product CRUD API Methods
 * ========================================================================= */

/**
 * Fetch all registered products for current user.
 */
export async function getProducts(): Promise<ProductResponse[]> {
  try {
    const data = await fetchWithAuth<ProductResponse[]>('/api/products', {
      method: 'GET',
    });
    if (data) {
      saveProductsToStorage(data);
      return data;
    }
  } catch (err) {
    console.warn('API getProducts failed, using localStorage fallback if available:', err);
  }

  const cached = getProductsFromStorage();
  if (cached && Array.isArray(cached)) {
    return cached;
  }

  return [];
}

/**
 * Fetch single product by ID.
 */
export async function getProduct(id: number): Promise<ProductResponse> {
  try {
    return await fetchWithAuth<ProductResponse>(`/api/products/${id}`, {
      method: 'GET',
    });
  } catch (err) {
    console.warn(`API getProduct(${id}) failed:`, err);
    const cached = getProductsFromStorage() || [];
    const found = cached.find((p: ProductResponse) => p.id === id);
    if (found) return found;
    throw err;
  }
}

/**
 * Create a new product.
 */
export async function createProduct(request: ProductRequest): Promise<ProductResponse> {
  try {
    const data = await fetchWithAuth<ProductResponse>('/api/products', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    if (data) {
      const existing = getProductsFromStorage() || [];
      saveProductsToStorage([...existing.filter((p: ProductResponse) => p.id !== data.id), data]);
      return data;
    }
  } catch (err) {
    console.warn('API createProduct failed, saving locally:', err);
  }

  // Local fallback mock creation
  const isNightOnly =
    request.ingredientTags?.includes('RETINOL') ||
    request.ingredientTags?.includes('AHA_BHA') ||
    false;

  const mockCreated: ProductResponse = {
    id: Date.now(),
    name: request.name,
    usageStep: request.usageStep,
    ingredientTags: request.ingredientTags || [],
    cycleType: request.cycleType,
    cycleIntervalDays: request.cycleIntervalDays || null,
    cycleWeekdays: request.cycleWeekdays || null,
    nightOnly: isNightOnly,
    lastUsedAt: request.lastUsedAt || null,
    nextUseDate: new Date().toISOString().split('T')[0],
  };

  const existing = getProductsFromStorage() || [];
  saveProductsToStorage([...existing, mockCreated]);
  return mockCreated;
}

/**
 * Update an existing product.
 */
export async function updateProduct(
  id: number,
  request: ProductRequest
): Promise<ProductResponse> {
  try {
    const data = await fetchWithAuth<ProductResponse>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
    if (data) {
      const existing = getProductsFromStorage() || [];
      saveProductsToStorage(existing.map((p: ProductResponse) => (p.id === id ? data : p)));
      return data;
    }
  } catch (err) {
    console.warn(`API updateProduct(${id}) failed, saving locally:`, err);
  }

  const isNightOnly =
    request.ingredientTags?.includes('RETINOL') ||
    request.ingredientTags?.includes('AHA_BHA') ||
    false;

  const mockUpdated: ProductResponse = {
    id,
    name: request.name,
    usageStep: request.usageStep,
    ingredientTags: request.ingredientTags || [],
    cycleType: request.cycleType,
    cycleIntervalDays: request.cycleIntervalDays || null,
    cycleWeekdays: request.cycleWeekdays || null,
    nightOnly: isNightOnly,
    lastUsedAt: request.lastUsedAt || null,
    nextUseDate: new Date().toISOString().split('T')[0],
  };

  const existing = getProductsFromStorage() || [];
  saveProductsToStorage(existing.map((p: ProductResponse) => (p.id === id ? mockUpdated : p)));
  return mockUpdated;
}

/**
 * Delete a product by ID.
 */
export async function deleteProduct(id: number): Promise<void> {
  try {
    await fetchWithAuth<void>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn(`API deleteProduct(${id}) failed:`, err);
  }

  const existing = getProductsFromStorage() || [];
  saveProductsToStorage(existing.filter((p: ProductResponse) => p.id !== id));
}

