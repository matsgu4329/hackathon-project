'use client';

import React from 'react';
import Link from 'next/link';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { NotificationItem, NotificationType } from '../../types/notification';
import { ChevronRight, Clock, Sun, Home, Package, Check, Clock3, X } from 'lucide-react';

const TYPE_LABEL: Record<NotificationType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  MORNING_BRIEFING: { label: '☀️ 아침 브리핑', icon: Sun, color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' },
  HOMECOMING_BRIEFING: { label: '🏠 귀가 브리핑', icon: Home, color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' },
  PRODUCT_CYCLE: { label: '🧴 제품 주기', icon: Package, color: 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function NotificationCard({
  item,
  onUpdate,
}: {
  item: NotificationItem;
  onUpdate: (id: string | number, status: 'COMPLETED' | 'LATER' | 'DISMISSED') => void;
}) {
  const meta = TYPE_LABEL[item.type];
  const Icon = meta.icon;
  const isProcessed = item.status !== 'PENDING';

  return (
    <div
      className={`p-4 rounded-2xl border transition-all ${
        isProcessed
          ? 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 opacity-70'
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 ${meta.color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${meta.color}`}>{meta.label}</span>
              <span className="text-[11px] text-zinc-400 font-mono">{formatDateTime(item.createdAt)}</span>
            </div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">{item.title}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 whitespace-pre-line leading-relaxed">
              {item.content}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-3">
        {isProcessed ? (
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
            {item.status === 'COMPLETED' ? '✓ 완료됨' : item.status === 'LATER' ? '나중에 처리' : '닫힘'}
            {item.processedAt ? ` · ${formatDateTime(item.processedAt)}` : ''}
          </span>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onUpdate(item.id, 'DISMISSED')}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              title="닫기"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onUpdate(item.id, 'LATER')}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Clock3 className="w-3.5 h-3.5" />
              나중에
            </button>
            <button
              type="button"
              onClick={() => onUpdate(item.id, 'COMPLETED')}
              className="px-3 py-1.5 rounded-lg text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              완료 처리
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications, isLoading, updateNotificationStatus } = useNotifications();

  const handleUpdate = (id: string | number, status: 'COMPLETED' | 'LATER' | 'DISMISSED') => {
    updateNotificationStatus({ id, status });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/15 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/dashboard"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform"
            >
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Link href="/dashboard" className="hover:text-zinc-700 dark:hover:text-zinc-200">
                  대시보드
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold">알림 센터</span>
              </div>
              <h1 className="font-extrabold text-base tracking-tight">알림 센터</h1>
            </div>
          </div>
          <Link
            href="/history"
            className="text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-colors"
          >
            이행 리포트
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-3">
        {isLoading ? (
          <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500">알림을 불러오는 중입니다...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">아직 받은 알림이 없습니다.</p>
          </div>
        ) : (
          notifications.map((item) => (
            <NotificationCard key={item.id} item={item} onUpdate={handleUpdate} />
          ))
        )}
      </main>
    </div>
  );
}
