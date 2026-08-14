import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationItem } from '../../types/notification';
import { useSituationStore } from '../../stores/useSituationStore';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

const INITIAL_MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'MORNING_BRIEFING',
    title: '☀️ 오늘 아침 스킨케어 브리핑',
    content: '오늘 자외선 지수가 다소 높습니다. 외출 전 SPF50+ 선크림을 꼼꼼히 바르세요!',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'n-2',
    type: 'PRODUCT_CYCLE',
    title: '🧴 레티놀 세럼 사용 주기 도래',
    content: '오늘은 3일 주기 레티놀 세럼을 사용하는 날입니다. (🌙 취침 전 전용)',
    status: 'PENDING',
    productName: '레티놀 0.1% 탄력 세럼',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

export function useNotifications() {
  const queryClient = useQueryClient();
  const { triggerReturnHome } = useSituationStore();

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: async (): Promise<NotificationItem[]> => {
      // Future: fetchWithAuth<NotificationItem[]>('/api/notifications')
      return INITIAL_MOCK_NOTIFICATIONS;
    },
    staleTime: 1000 * 60 * 2,
  });

  // Trigger Homecoming Simulation
  const triggerHomecomingMutation = useMutation({
    mutationFn: async (): Promise<NotificationItem> => {
      // Future: POST /api/situations/homecoming
      const newNotif: NotificationItem = {
        id: `n-home-${Date.now()}`,
        type: 'HOMECOMING_BRIEFING',
        title: '🏡 귀가 감지! 세안 안내',
        content: '외출 후 귀가를 감지했습니다! 선크림과 미세먼지를 씻어낼 세안 루틴을 시작하세요.',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      return newNotif;
    },
    onSuccess: (newNotif) => {
      triggerReturnHome();
      queryClient.setQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY, (prev) => [
        newNotif,
        ...(prev || []),
      ]);
    },
  });

  // Mark notification as completed / dismissed
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string | number;
      status: 'COMPLETED' | 'DISMISSED' | 'LATER';
    }) => {
      // Future: PATCH /api/notifications/{id}/status
      return { id, status };
    },
    onSuccess: ({ id, status }) => {
      queryClient.setQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY, (prev) =>
        (prev || []).map((n) => (n.id === id ? { ...n, status } : n))
      );
    },
  });

  return {
    ...query,
    notifications: query.data || [],
    triggerHomecoming: triggerHomecomingMutation.mutate,
    isTriggeringHomecoming: triggerHomecomingMutation.isPending,
    updateNotificationStatus: updateStatusMutation.mutate,
  };
}
