export type SkinType = 'DRY' | 'OILY' | 'COMBINATION' | 'SENSITIVE' | 'UNKNOWN';

export type OutingPatternType = 'REGULAR' | 'IRREGULAR';

export interface UserProfileRequest {
  skinType: SkinType;
  outingPatternType: OutingPatternType;
  outingStartTime?: string | null; // HH:mm format, e.g. "09:00"
  outingEndTime?: string | null;   // HH:mm format, e.g. "18:00"
  preferredNotificationTime?: string | null; // HH:mm format, e.g. "08:00"
  baseRoutineItems: string[];
}

export interface UserProfileResponse {
  skinType: SkinType | null;
  outingPatternType: OutingPatternType | null;
  outingStartTime: string | null;
  outingEndTime: string | null;
  preferredNotificationTime: string | null;
  baseRoutineItems: string[];
  onboardingCompleted: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
