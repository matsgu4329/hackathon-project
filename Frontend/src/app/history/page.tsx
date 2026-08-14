'use client';

import React from 'react';
import Link from 'next/link';
import { useRoutineLogSummary, useRoutineLogs } from '../../hooks/queries/useRoutineLogs';
import { ChevronRight, Clock, Flame, CheckCircle2 } from 'lucide-react';

const TYPE_LABEL: Record<string, string> = {
  MORNING_BRIEFING: '☀️ 아침 브리핑',
  HOMECOMING_BRIEFING: '🏠 귀가 브리핑',
  PRODUCT_CYCLE: '🧴 제품 주기',
};

const STATUS_LABEL: Record<string, string> = {
  COMPLETED: '완료 ✅',
  LATER: '나중에',
  DISMISSED: '닫힘',
};

function today(): string {
  return new Date().toISOString().split('T')[0];
}

export default function HistoryPage() {
  const { data: summary, isLoading: isSummaryLoading } = useRoutineLogSummary();
  const { data: todayLogs, isLoading: isTodayLoading } = useRoutineLogs(today(), today());

  const dayDotColor = (status: string) => {
    if (status === 'COMPLETE') return 'bg-emerald-500';
    if (status === 'PARTIAL') return 'bg-amber-400';
    return 'bg-zinc-200 dark:bg-zinc-700';
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
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold">이행 리포트</span>
              </div>
              <h1 className="font-extrabold text-base tracking-tight">나의 스킨케어 달성률</h1>
            </div>
          </div>
          <Link
            href="/notifications"
            className="text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 transition-colors"
          >
            알림 센터
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
        {isSummaryLoading ? (
          <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500">이행 기록을 불러오는 중입니다...</p>
          </div>
        ) : (
          <>
            {/* Streak & completion rate */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-orange-500 text-white shadow-sm">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold">{summary?.streakDays ?? 0}일</div>
                  <div className="text-xs text-zinc-500">연속 달성</div>
                </div>
              </div>
              <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-600 text-white shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold">
                    {Math.round((summary?.monthlyCompletionRate ?? 0) * 100)}%
                  </div>
                  <div className="text-xs text-zinc-500">이번 달 이행률</div>
                </div>
              </div>
            </div>

            {/* Calendar heatmap (simple dot grid) */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-sm font-bold mb-3">이번 달 이행 현황</h2>
              {summary && summary.dailyStatus.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {summary.dailyStatus.map((d) => (
                    <div key={d.date} className="flex flex-col items-center gap-1" title={d.date}>
                      <span className={`w-3.5 h-3.5 rounded-full ${dayDotColor(d.status)}`} />
                      <span className="text-[9px] text-zinc-400">{d.date.slice(-2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">아직 이행 기록이 없습니다. 알림을 완료 처리하면 여기에 표시됩니다.</p>
              )}
              <div className="flex items-center gap-4 mt-4 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 완료</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" /> 일부 완료</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-zinc-200 dark:bg-zinc-700 inline-block" /> 미이행</span>
              </div>
            </div>

            {/* Today's entries */}
            <div className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-sm font-bold mb-3">오늘의 이행 내역</h2>
              {isTodayLoading ? (
                <p className="text-xs text-zinc-500">불러오는 중...</p>
              ) : !todayLogs || todayLogs.length === 0 ? (
                <p className="text-xs text-zinc-500">오늘 처리한 알림이 아직 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {todayLogs.map((log) => (
                    <li key={log.id} className="flex items-center justify-between text-xs">
                      <span className="font-semibold">{TYPE_LABEL[log.notificationType] || log.notificationType}</span>
                      <span className="text-zinc-500">
                        {log.completedAt ? new Date(log.completedAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}
                        {' · '}
                        {STATUS_LABEL[log.status] || log.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
