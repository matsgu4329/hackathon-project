import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyRecommendation, RecommendationStep } from '../../types/recommendation';
import { useSituationStore } from '../../stores/useSituationStore';
import { getProfile } from '../../lib/api';

/**
 * Generates dynamic mock recommendations based on situation & profile.
 * When backend Phase 5 API (`GET /api/recommendations/today`) is connected,
 * replace the queryFn below with the actual fetch call.
 */
async function fetchDailyRecommendationMock(
  uvIndex: number,
  weatherState: 'CLEAR' | 'RAIN' | 'DRY',
  locationState: 'OUTDOOR' | 'HOME'
): Promise<DailyRecommendation> {
  const profile = await getProfile();
  const skinType = profile.skinType || 'COMBINATION';
  const today = new Date().toISOString().split('T')[0];

  // UV-based sunscreen advice
  let sunDescription = '자외선 차단제 (SPF30+ PA+++) 도포';
  if (uvIndex >= 8) {
    sunDescription = `강력 자외선 차단제 (SPF50+ PA++++) 도포 (현재 UV ${uvIndex} - 매우 강함, 2~3시간 간격 덧바름 필수!)`;
  } else if (uvIndex >= 6) {
    sunDescription = `자외선 차단제 (SPF50+ PA++++) 꼼꼼히 도포 (현재 UV ${uvIndex} - 높음)`;
  }

  // Cleansing advice based on skin type & weather
  let morningCleanser = '미온수로 가벼운 아침 약산성 세안';
  if (skinType === 'OILY') {
    morningCleanser = 'T존 중심 젤 클렌저로 과잉 피지 세안';
  } else if (skinType === 'DRY') {
    morningCleanser = '물세안 또는 약산성 밀크 클렌저로 수분 장벽 보존 세안';
  } else if (skinType === 'SENSITIVE') {
    morningCleanser = '저자극 폼 클렌저로 부드러운 거품 세안';
  }

  // Homecoming cleansing advice
  let homecomingCleanser = '귀가 후 선크림 & 미세먼지 2차 딥클렌징';
  if (uvIndex >= 8) {
    homecomingCleanser = '선크림 잔여물 및 자극 진정을 위한 오일+폼 2중 딥클렌징';
  } else if (weatherState === 'RAIN') {
    homecomingCleanser = '습한 날씨로 번들거린 피부를 위한 산뜻 젤 세안';
  }

  const steps: RecommendationStep[] = [
    {
      id: 'step-1',
      stepOrder: 1,
      timeSlot: 'MORNING',
      description: morningCleanser,
      cleansingGuide: '피부 타입 맞춤 세안',
      productName: '보유: 약산성 클렌저',
      completed: false,
    },
    {
      id: 'step-2',
      stepOrder: 2,
      timeSlot: 'MORNING',
      description: '토너/스킨으로 피부결 정돈 및 1차 수분 공급',
      productName: '보유: 진정 수분 토너',
      completed: false,
    },
    {
      id: 'step-3',
      stepOrder: 3,
      timeSlot: 'MORNING',
      description: '수분 보습 크림 얇게 펴 바르기',
      productName: '보유: 수분 보습 크림',
      completed: false,
    },
    {
      id: 'step-4',
      stepOrder: 4,
      timeSlot: 'MORNING',
      description: sunDescription,
      productName: '보유: 데일리 선크림',
      warningBadge: uvIndex >= 8 ? '☀️ 자외선 주의 (UV 8+)' : null,
      completed: false,
    },
    {
      id: 'step-5',
      stepOrder: 5,
      timeSlot: 'HOMECOMING',
      description: homecomingCleanser,
      cleansingGuide: '귀가 즉시 세안 권장',
      productName: '보유: 클렌징 오일/폼',
      completed: false,
    },
    {
      id: 'step-6',
      stepOrder: 6,
      timeSlot: 'NIGHT',
      description: '취침 전 기능성 나이트 세럼 & 고보습 슬리핑 케어',
      productName: '보유: 레티놀 탄력 세럼',
      warningBadge: '🌙 밤 전용',
      completed: false,
    },
  ];

  return {
    date: today,
    cleansingMethod:
      locationState === 'HOME'
        ? '귀가 후 외출 유해물질 세정을 위한 2차 세안 권장'
        : '자외선 지수와 라이프스타일을 고려한 데일리 케어',
    weatherSummary: {
      weatherState,
      uvIndex,
      humidity: weatherState === 'RAIN' ? 85 : weatherState === 'DRY' ? 35 : 60,
    },
    steps,
    disclaimer:
      'SkinClock의 안내는 일반적인 생활 습관 관리 참고용이며, 의학적 진단이나 처방을 대신하지 않습니다.',
  };
}

export const RECOMMENDATION_QUERY_KEY = ['daily-recommendation'];

export function useDailyRecommendation() {
  const queryClient = useQueryClient();
  const { mockUvIndex, mockWeather, currentLocationState } = useSituationStore();

  const query = useQuery({
    queryKey: [...RECOMMENDATION_QUERY_KEY, mockUvIndex, mockWeather, currentLocationState],
    queryFn: () =>
      fetchDailyRecommendationMock(mockUvIndex, mockWeather, currentLocationState),
    staleTime: 1000 * 60 * 5,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      // Future: POST /api/recommendations/today/refresh
      return fetchDailyRecommendationMock(mockUvIndex, mockWeather, currentLocationState);
    },
    onSuccess: (newData) => {
      queryClient.setQueryData(
        [...RECOMMENDATION_QUERY_KEY, mockUvIndex, mockWeather, currentLocationState],
        newData
      );
    },
  });

  return {
    ...query,
    refreshRecommendation: refreshMutation.mutate,
    isRefreshing: refreshMutation.isPending,
  };
}
