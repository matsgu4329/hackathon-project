'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { UserProfileResponse } from '../../types/profile';
import { getProfile, getProducts } from '../../lib/api';
import { useDailyRecommendation } from '../../hooks/queries/useDailyRecommendation';
import { useNotifications } from '../../hooks/queries/useNotifications';
import { ScenarioSimulatorBar } from '../../components/dashboard/ScenarioSimulatorBar';
import { WeatherUvWidget } from '../../components/dashboard/WeatherUvWidget';
import { RoutineChecklist } from '../../components/dashboard/RoutineChecklist';
import { HomecomingBanner } from '../../components/dashboard/HomecomingBanner';
import {
  Clock,
  Sparkles,
  Package,
  Sliders,
  ChevronRight,
  Bell,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [productCount, setProductCount] = useState<number>(0);

  // TanStack Query Hooks for Phase 5 & 6 Data
  const {
    data: recommendation,
    isLoading: isRecLoading,
    refreshRecommendation,
    isRefreshing,
  } = useDailyRecommendation();

  const { notifications } = useNotifications();

  // Load user profile & products on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [profData, prodData] = await Promise.all([getProfile(), getProducts()]);
        setProfile(profData);
        setProductCount(prodData?.length || 0);
      } catch (err) {
        console.warn('Profile load error:', err);
      }
    }
    loadData();
  }, []);

  const pendingNotificationsCount = notifications.filter((n) => n.status === 'PENDING').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/15 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Toast Alert for Homecoming Simulation */}
      <HomecomingBanner />

      {/* Top Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 hover:scale-105 transition-transform"
            >
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </Link>
            <div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Link href="/" className="hover:text-zinc-700 dark:hover:text-zinc-200">
                  SkinClock
                </Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-zinc-800 dark:text-zinc-200 font-semibold">대시보드</span>
              </div>
              <h1 className="font-extrabold text-base tracking-tight text-zinc-900 dark:text-zinc-100">
                오늘의 피부 시계 & 루틴
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Products link */}
            <Link
              href="/products"
              className="text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>보유 제품 ({productCount})</span>
            </Link>

            {/* Onboarding edit link */}
            <Link
              href="/onboarding"
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 px-2.5 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors hidden sm:inline-block"
            >
              프로필 수정
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* 1) MVP Simulator Bar (FE PRD Section 4.1) */}
        <ScenarioSimulatorBar />

        {/* 2) Weather & UV Environmental Hero Card */}
        <WeatherUvWidget
          skinType={profile?.skinType}
          onRefresh={refreshRecommendation}
          isRefreshing={isRefreshing}
        />

        {/* 3) Daily Recommendations Checklist */}
        {isRecLoading || !recommendation ? (
          <div className="p-12 text-center rounded-3xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-xs text-zinc-500">실시간 기상 및 프로필 기반 루틴을 계산 중입니다...</p>
          </div>
        ) : (
          <RoutineChecklist recommendation={recommendation} />
        )}
      </main>

      {/* Footer Disclaimer (FE PRD Section 6.3) */}
      <footer className="max-w-4xl mx-auto w-full px-4 py-4 text-center border-t border-zinc-200/60 dark:border-zinc-800">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
          ⚠️ SkinClock의 안내는 일반적인 생활 습관 관리 참고용이며, 의학적 진단이나 처방을 대신하지 않습니다. 피부 이상 발생 시 전문의와 상담하세요.
        </p>
      </footer>
    </div>
  );
}
