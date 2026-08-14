import { ApiResponse, UserProfileRequest, UserProfileResponse } from '../types/profile';
import { getClientUserId, getProfileFromStorage, saveProfileToStorage } from './storage';

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
  // Always update local cache for instant offline persistence
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
