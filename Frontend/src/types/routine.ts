export type DayStatus = 'COMPLETE' | 'PARTIAL' | 'NONE';

export interface RoutineLogSummary {
  streakDays: number;
  monthlyCompletionRate: number;
  dailyStatus: { date: string; status: DayStatus }[];
}

export interface RoutineLogEntry {
  id: number;
  date: string;
  notificationType: 'MORNING_BRIEFING' | 'HOMECOMING_BRIEFING' | 'PRODUCT_CYCLE';
  status: 'COMPLETED' | 'LATER' | 'DISMISSED';
  completedAt: string | null;
}
