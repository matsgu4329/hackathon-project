import { UserProfileResponse, UserProfileRequest } from '../types/profile';

const USER_ID_KEY = 'skinclock_client_user_id';
const PROFILE_KEY = 'skinclock_profile_cache';

/**
 * Get or create a persistent client UUID for X-User-Id header.
 */
export function getClientUserId(): string {
  if (typeof window === 'undefined') {
    return 'default-ssr-user-id';
  }

  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      userId = crypto.randomUUID();
    } else {
      userId = 'user_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

/**
 * Cache profile locally to ensure offline usability and quick hydration.
 */
export function saveProfileToStorage(profile: UserProfileResponse | UserProfileRequest): void {
  if (typeof window === 'undefined') return;
  try {
    const dataToSave = {
      ...profile,
      onboardingCompleted: true,
      cachedAt: new Date().toISOString(),
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(dataToSave));
  } catch (err) {
    console.warn('Failed to save profile to localStorage', err);
  }
}

/**
 * Retrieve cached profile from localStorage.
 */
export function getProfileFromStorage(): UserProfileResponse | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfileResponse;
  } catch (err) {
    console.warn('Failed to parse cached profile from localStorage', err);
    return null;
  }
}
