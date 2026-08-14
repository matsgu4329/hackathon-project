import { useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationItem, NotificationStatus } from '../../types/notification';
import { useSituationStore } from '../../stores/useSituationStore';
import {
  getNotifications,
  triggerHomecomingBriefing,
  triggerMorningBriefing,
  updateNotificationStatus,
} from '../../lib/api';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export function useNotifications() {
  const queryClient = useQueryClient();
  const { triggerReturnHome } = useSituationStore();
  const morningBriefingRequested = useRef(false);

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: getNotifications,
    retry: false,
    staleTime: 1000 * 60 * 2,
  });

  // Ensure a morning briefing exists so the notification list has real
  // content to demo — the backend dedupes per (user, type, day), so calling
  // this more than once per day is harmless.
  useEffect(() => {
    if (morningBriefingRequested.current) return;
    morningBriefingRequested.current = true;
    triggerMorningBriefing()
      .then(() => queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY }))
      .catch((err) => console.warn('Auto morning-briefing trigger failed:', err));
  }, [queryClient]);

  const triggerHomecomingMutation = useMutation({
    mutationFn: triggerHomecomingBriefing,
    onSuccess: (newNotif) => {
      triggerReturnHome();
      queryClient.setQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY, (prev) => [
        newNotif,
        ...(prev || []).filter((n) => n.id !== newNotif.id),
      ]);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string | number; status: NotificationStatus }) => {
      if (status === 'PENDING') {
        throw new Error('PENDING으로는 되돌릴 수 없습니다.');
      }
      return updateNotificationStatus(id, status);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<NotificationItem[]>(NOTIFICATIONS_QUERY_KEY, (prev) =>
        (prev || []).map((n) => (n.id === updated.id ? updated : n))
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
