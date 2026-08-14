import { ApiResponse, UserProfileRequest, UserProfileResponse } from '../types/profile';
import { ProductRequest, ProductResponse } from '../types/product';
import { DailyRecommendation, TimeSlot } from '../types/recommendation';
import { NotificationItem, NotificationStatus, NotificationType } from '../types/notification';
import { RoutineLogEntry, RoutineLogSummary } from '../types/routine';
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

/* =========================================================================
 * Weather API (Phase 4) — backs the dashboard simulator
 * ========================================================================= */

export interface WeatherSnapshotResponse {
  id: number;
  weatherState: 'CLEAR' | 'CLOUDY' | 'RAIN' | 'DRY';
  uvIndex: number;
  humidity: number | null;
  temperature: number | null;
  fetchedAt: string;
  isFallback: boolean;
  source: string;
}

export async function getCurrentWeather(): Promise<WeatherSnapshotResponse> {
  return fetchWithAuth<WeatherSnapshotResponse>('/api/weather/current', { method: 'GET' });
}

/**
 * Pushes the FE simulator's chosen weather/UV into the backend (Phase 4's
 * demo endpoint), so the ScenarioSimulatorBar actually drives the real
 * recommendation engine instead of a client-only mock.
 */
export async function pushMockWeather(
  weatherState: WeatherSnapshotResponse['weatherState'],
  uvIndex: number,
  humidity?: number,
  temperature?: number
): Promise<WeatherSnapshotResponse> {
  return fetchWithAuth<WeatherSnapshotResponse>('/api/weather/mock', {
    method: 'POST',
    body: JSON.stringify({ weatherState, uvIndex, humidity, temperature }),
  });
}

/* =========================================================================
 * Daily Recommendation API (Phase 5)
 * ========================================================================= */

interface BackendRecommendationStep {
  stepOrder: number;
  timeSlot: TimeSlot;
  description: string;
  warningBadge: string | null;
  relatedProductId: number | null;
  relatedProductName: string | null;
}

interface BackendDailyRecommendation {
  date: string;
  cleansingMethod: string;
  weatherConditionUsed: WeatherSnapshotResponse['weatherState'];
  uvIndexUsed: number;
  disclaimer: string;
  steps: BackendRecommendationStep[];
}

function mapRecommendation(raw: BackendDailyRecommendation, humidity: number): DailyRecommendation {
  return {
    date: raw.date,
    cleansingMethod: raw.cleansingMethod,
    weatherSummary: {
      weatherState: raw.weatherConditionUsed,
      uvIndex: raw.uvIndexUsed,
      humidity,
    },
    steps: raw.steps.map((step) => ({
      id: `${raw.date}-${step.stepOrder}`,
      stepOrder: step.stepOrder,
      timeSlot: step.timeSlot,
      description: step.description,
      productId: step.relatedProductId,
      productName: step.relatedProductName || undefined,
      warningBadge: step.warningBadge,
    })),
    disclaimer: raw.disclaimer,
  };
}

async function withHumidity(raw: BackendDailyRecommendation): Promise<DailyRecommendation> {
  const weather = await getCurrentWeather().catch(() => null);
  return mapRecommendation(raw, weather?.humidity ?? 50);
}

export async function getTodayRecommendation(): Promise<DailyRecommendation> {
  const raw = await fetchWithAuth<BackendDailyRecommendation>('/api/recommendations/today', {
    method: 'GET',
  });
  return withHumidity(raw);
}

export async function refreshTodayRecommendation(): Promise<DailyRecommendation> {
  const raw = await fetchWithAuth<BackendDailyRecommendation>('/api/recommendations/today/refresh', {
    method: 'POST',
  });
  return withHumidity(raw);
}

/* =========================================================================
 * Notification API (Phase 6 + 7)
 * ========================================================================= */

interface BackendNotification {
  id: number;
  type: NotificationType;
  title: string;
  content: string;
  status: NotificationStatus;
  createdAt: string;
  processedAt: string | null;
}

function mapNotification(n: BackendNotification): NotificationItem {
  return {
    id: n.id,
    type: n.type,
    title: n.title,
    content: n.content,
    status: n.status,
    createdAt: n.createdAt,
    processedAt: n.processedAt,
  };
}

export async function getNotifications(): Promise<NotificationItem[]> {
  const data = await fetchWithAuth<BackendNotification[]>('/api/notifications', { method: 'GET' });
  return data.map(mapNotification);
}

/** 귀가 모의 입력 → 귀가 브리핑 알림 즉시 생성 */
export async function triggerHomecomingBriefing(): Promise<NotificationItem> {
  const data = await fetchWithAuth<BackendNotification>('/api/situations/homecoming', {
    method: 'POST',
  });
  return mapNotification(data);
}

/** 당일 없으면 생성, 있으면 기존 알림 반환 (중복 방지는 백엔드가 처리) */
export async function triggerMorningBriefing(): Promise<NotificationItem> {
  const data = await fetchWithAuth<BackendNotification>('/api/notifications/morning-briefing/trigger', {
    method: 'POST',
  });
  return mapNotification(data);
}

export async function updateNotificationStatus(
  id: number | string,
  status: 'COMPLETED' | 'LATER' | 'DISMISSED'
): Promise<NotificationItem> {
  const data = await fetchWithAuth<BackendNotification>(`/api/notifications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return mapNotification(data);
}

/* =========================================================================
 * Routine Log API (Phase 7) — /history screen
 * ========================================================================= */

export async function getRoutineLogsSummary(yearMonth: string): Promise<RoutineLogSummary> {
  return fetchWithAuth<RoutineLogSummary>(
    `/api/routine-logs/summary?yearMonth=${encodeURIComponent(yearMonth)}`,
    { method: 'GET' }
  );
}

export async function getRoutineLogs(from: string, to: string): Promise<RoutineLogEntry[]> {
  return fetchWithAuth<RoutineLogEntry[]>(
    `/api/routine-logs?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { method: 'GET' }
  );
}

