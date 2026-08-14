import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyRecommendation } from '../../types/recommendation';
import { useSituationStore } from '../../stores/useSituationStore';
import { refreshTodayRecommendation, pushMockWeather } from '../../lib/api';

/** Matches WeatherUvWidget's static humidity assumptions per mock weather type. */
function humidityFor(weather: 'CLEAR' | 'RAIN' | 'DRY'): number {
  if (weather === 'RAIN') return 85;
  if (weather === 'DRY') return 35;
  return 60;
}

/**
 * Pushes the simulator's UV/weather into the real backend (Phase 4's
 * /api/weather/mock) and asks Phase 5's recommendation engine to recompute,
 * so the dashboard reflects the actual backend pipeline (Phase 4→5→6).
 */
async function fetchDailyRecommendation(
  uvIndex: number,
  weatherState: 'CLEAR' | 'RAIN' | 'DRY'
): Promise<DailyRecommendation> {
  await pushMockWeather(weatherState, uvIndex, humidityFor(weatherState));
  return refreshTodayRecommendation();
}

export const RECOMMENDATION_QUERY_KEY = ['daily-recommendation'];

export function useDailyRecommendation() {
  const queryClient = useQueryClient();
  const { mockUvIndex, mockWeather } = useSituationStore();

  const query = useQuery({
    queryKey: [...RECOMMENDATION_QUERY_KEY, mockUvIndex, mockWeather],
    queryFn: () => fetchDailyRecommendation(mockUvIndex, mockWeather),
    // Fall back to the last generated recommendation (no weather push) if the
    // profile/backend isn't ready yet, instead of retrying forever.
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const refreshMutation = useMutation({
    mutationFn: () => fetchDailyRecommendation(mockUvIndex, mockWeather),
    onSuccess: (newData) => {
      queryClient.setQueryData([...RECOMMENDATION_QUERY_KEY, mockUvIndex, mockWeather], newData);
    },
  });

  return {
    ...query,
    refreshRecommendation: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
  };
}
