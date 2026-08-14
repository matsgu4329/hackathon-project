export type TimeSlot = 'MORNING' | 'HOMECOMING' | 'NIGHT';

export interface RecommendationStep {
  id?: number | string;
  stepOrder: number;
  timeSlot: TimeSlot;
  description: string;
  cleansingGuide?: string;
  productId?: number | null;
  productName?: string;
  warningBadge?: string | null; // e.g. "NIGHT_ONLY", "REAPPLY_SUNCARE"
  completed?: boolean;
}

export interface DailyRecommendation {
  id?: number | string;
  date: string; // yyyy-MM-dd
  cleansingMethod: string;
  weatherSummary: {
    weatherState: 'CLEAR' | 'CLOUDY' | 'RAIN' | 'DRY';
    uvIndex: number;
    humidity: number;
  };
  steps: RecommendationStep[];
  disclaimer: string;
}
