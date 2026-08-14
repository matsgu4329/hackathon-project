import { useQuery } from '@tanstack/react-query';
import { getRoutineLogsSummary, getRoutineLogs } from '../../lib/api';

function currentYearMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function useRoutineLogSummary(yearMonth: string = currentYearMonth()) {
  return useQuery({
    queryKey: ['routine-log-summary', yearMonth],
    queryFn: () => getRoutineLogsSummary(yearMonth),
    retry: false,
    staleTime: 1000 * 60,
  });
}

export function useRoutineLogs(from: string, to: string) {
  return useQuery({
    queryKey: ['routine-logs', from, to],
    queryFn: () => getRoutineLogs(from, to),
    retry: false,
    staleTime: 1000 * 60,
  });
}
