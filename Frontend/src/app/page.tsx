'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getProfile } from '../lib/api';
import { Clock, Sparkles, ArrowRight, ShieldCheck, Sun, Droplets } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState<boolean>(true);

  useEffect(() => {
    async function checkUserStatus() {
      try {
        const profile = await getProfile();
        if (profile?.onboardingCompleted) {
          // If already onboarded, we can redirect or offer dashboard
          // router.push('/dashboard');
        }
      } catch (err) {
        console.warn('Profile check error:', err);
      } finally {
        setChecking(false);
      }
    }
    checkUserStatus();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/20 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Navigation */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800 backdrop-blur-md bg-white/60 dark:bg-zinc-950/60 sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
            SkinClock
          </span>
        </div>

        <Link
          href="/onboarding"
          className="text-xs font-semibold px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
        >
          온보딩 시작하기
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-6 border border-emerald-200/60 dark:border-emerald-800/40 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>상황 인지형 데일리 스킨케어 코치</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight text-zinc-900 dark:text-zinc-50">
          날씨와 일과에 맞춘 <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
            나만의 피부 시계
          </span>
        </h1>

        <p className="mt-4 text-base text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-lg">
          실시간 자외선 지수, 날씨, 외출 패턴을 분석하여 귀가 후 딥클렌징부터 취침 전 성분 케어까지 지금 딱 필요한 루틴을 알려드립니다.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-8 w-full">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-left">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 w-fit mb-2.5">
              <Sun className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">실시간 UV & 날씨</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">자외선 강도에 따른 맞춤 선케어 처방</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-left">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 w-fit mb-2.5">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">귀가 감지 세안</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">외출 후 오염물질을 지우는 스마트 알림</p>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-left">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 w-fit mb-2.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">성분 주기 관리</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">레티놀, 팩 등 주기성 케어 자동 스케줄</p>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-base shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all transform hover:-translate-y-0.5"
        >
          <span>30초 피부 프로필 설정하기</span>
          <ArrowRight className="w-5 h-5" />
        </Link>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800">
        <p>© 2026 SkinClock. All rights reserved.</p>
      </footer>
    </div>
  );
}
