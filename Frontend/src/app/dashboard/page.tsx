'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserProfileResponse } from '../../types/profile';
import { ProductResponse } from '../../types/product';
import { getProfile, getProducts } from '../../lib/api';
import {
  Clock,
  Sun,
  CloudRain,
  Home,
  Sparkles,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Moon,
  RefreshCw,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  Flame,
  Droplets,
  Sliders,
} from 'lucide-react';

interface RoutineItem {
  id: string;
  timeSlot: 'MORNING' | 'HOMECOMING' | 'NIGHT';
  title: string;
  description: string;
  completed: boolean;
  productName?: string;
  nightOnly?: boolean;
  warningBadge?: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Situation Simulator State (FE PRD Section 4.1)
  const [currentLocationState, setCurrentLocationState] = useState<'OUTDOOR' | 'HOME'>('OUTDOOR');
  const [mockUvIndex, setMockUvIndex] = useState<number>(7);
  const [mockWeather, setMockWeather] = useState<'CLEAR' | 'RAIN' | 'DRY'>('CLEAR');
  const [homecomingToast, setHomecomingToast] = useState<boolean>(false);

  // Routine Checklist State
  const [routineList, setRoutineList] = useState<RoutineItem[]>([
    {
      id: 'r1',
      timeSlot: 'MORNING',
      title: '미온수로 가벼운 아침 약산성 세안',
      description: '밤사이 쌓인 피지와 먼지만 가볍게 씻어내어 유수분 장벽을 보호합니다.',
      completed: true,
      productName: '보유: 약산성 클렌징 폼',
    },
    {
      id: 'r2',
      timeSlot: 'MORNING',
      title: '수분 보습 크림 도포',
      description: '외출 전 건조함을 막고 수분 보호막을 형성합니다.',
      completed: true,
      productName: '보유: 수분 보습 크림',
    },
    {
      id: 'r3',
      timeSlot: 'MORNING',
      title: '자외선 차단제 (SPF50+ PA++++) 도포',
      description: '오늘 자외선 지수(UV 7 - 높음)에 대응하여 외출 30분 전 꼼꼼히 바르세요.',
      completed: false,
      productName: '보유: 자외선 차단제',
    },
    {
      id: 'r4',
      timeSlot: 'HOMECOMING',
      title: '귀가 후 선크림 & 미세먼지 2차 딥클렌징',
      description: '모공 속에 남은 자외선 차단제 성분과 외부 유해물질을 말끔히 씻어냅니다.',
      completed: false,
      productName: '클렌징 오일 / 폼',
    },
    {
      id: 'r5',
      timeSlot: 'NIGHT',
      title: '취침 전 보습 & 기능성 진정 나이트 케어',
      description: '피부 재생 시간 동안 보습과 영양을 집중 공급합니다.',
      completed: false,
      nightOnly: true,
      warningBadge: '🌙 밤 전용',
      productName: '레티놀 탄력 세럼 / 마스크팩',
    },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profData, prodData] = await Promise.all([getProfile(), getProducts()]);
        setProfile(profData);
        setProducts(prodData || []);
      } catch (err) {
        console.warn('Dashboard data load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleRoutine = (id: string) => {
    setRoutineList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleHomecomingTrigger = () => {
    setCurrentLocationState('HOME');
    setHomecomingToast(true);
    setTimeout(() => {
      setHomecomingToast(false);
    }, 4000);
  };

  const completedCount = routineList.filter((r) => r.completed).length;
  const progressRate = Math.round((completedCount / routineList.length) * 100);

  const getUvLevel = (uv: number) => {
    if (uv <= 2) return { label: '안전', color: 'bg-emerald-500 text-white', text: '자외선 지수가 낮습니다. 일상적인 보습만 유지하세요.' };
    if (uv <= 5) return { label: '보통', color: 'bg-amber-500 text-white', text: '외출 시 모자나 가벼운 선케어를 챙기세요.' };
    if (uv <= 8) return { label: '높음', color: 'bg-orange-600 text-white', text: '자외선이 강합니다. SPF50+ 선크림을 3~4시간 간격으로 덧발라주세요.' };
    return { label: '매우 높음', color: 'bg-rose-600 text-white', text: '야외 활동 시 그늘을 이용하고 긴소매와 자외선 차단제를 필수로 사용하세요.' };
  };

  const uvInfo = getUvLevel(mockUvIndex);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/15 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Toast Alert for Homecoming Simulation */}
      {homecomingToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-2xl flex items-center gap-3 animate-slide-down border border-emerald-400/30">
          <div className="p-2 rounded-2xl bg-white/20">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold">귀가 감지 완료! 🏡</h4>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              외출 후 선크림과 미세먼지를 씻어낼 [귀가 세안 루틴]이 시작되었습니다.
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
                SkinClock
              </span>
              <span className="ml-2 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 hidden sm:inline-block">
                데일리 스킨케어 대시보드
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/products"
              className="text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:text-emerald-600 px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-all flex items-center gap-1.5"
            >
              <Package className="w-3.5 h-3.5" />
              <span>화장품 관리 ({products.length})</span>
            </Link>
            <Link
              href="/onboarding"
              className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 px-2.5 py-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              온보딩 수정
            </Link>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* Hackathon Simulation Toolbar (FE PRD Section 4.1) */}
        <div className="p-4 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 text-white shadow-xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/30">
                Demo Simulator
              </span>
              <span className="text-xs font-bold text-zinc-200">해커톤 상황 시뮬레이터</span>
            </div>
            <span className="text-[11px] text-zinc-400">
              상태: {currentLocationState === 'OUTDOOR' ? '🚗 외출 중' : '🏠 귀가 완료'}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleHomecomingTrigger}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
                currentLocationState === 'HOME'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/40'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>🏠 귀가 모의 입력 (세안 알림)</span>
            </button>

            <button
              type="button"
              onClick={() => setCurrentLocationState('OUTDOOR')}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                currentLocationState === 'OUTDOOR'
                  ? 'bg-zinc-700 text-white'
                  : 'bg-zinc-800/60 hover:bg-zinc-750 text-zinc-400'
              }`}
            >
              외출 모드로 전환
            </button>

            <div className="flex items-center gap-1.5 ml-auto text-xs text-zinc-400 bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-750">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>UV 강도 조절:</span>
              {[3, 7, 10].map((uv) => (
                <button
                  key={uv}
                  type="button"
                  onClick={() => setMockUvIndex(uv)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                    mockUvIndex === uv ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {uv}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Environmental Context Card */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-md space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">📍 현재 위치 기상</span>
              <span className="text-xs text-zinc-400">• 방금 갱신됨</span>
            </div>
            <div className="flex items-center gap-2">
              {profile?.skinType && (
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  내 피부: {profile.skinType}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* UV Card */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-sm">
                <Sun className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">자외선 지수</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${uvInfo.color}`}>
                    UV {mockUvIndex} ({uvInfo.label})
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-snug">
                  {uvInfo.text}
                </p>
              </div>
            </div>

            {/* Weather / Cleansing Card */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-800/40 flex items-start gap-3.5">
              <div className="p-3 rounded-2xl bg-blue-500 text-white shadow-sm">
                <Droplets className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">습도 & 권장 세안</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                    습도 65% (쾌적)
                  </span>
                </div>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1 leading-snug">
                  외출 후 귀가 시 미온수와 약산성 클렌저로 자외선 차단제를 부드럽게 세정하세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Recommended Routine Checklist */}
        <div className="p-6 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-md space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  오늘의 추천 스킨케어 루틴
                </h2>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                체크박스를 눌러 오늘 실천한 루틴을 기록하세요 ({completedCount}/{routineList.length} 완료, {progressRate}%)
              </p>
            </div>

            {/* Mini Progress */}
            <div className="w-24 text-right">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {progressRate}%
              </span>
              <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progressRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Routine Item Cards */}
          <div className="space-y-3">
            {routineList.map((routine) => {
              const isHomeSlot = routine.timeSlot === 'HOMECOMING';
              const isHighlight = isHomeSlot && currentLocationState === 'HOME';

              return (
                <div
                  key={routine.id}
                  onClick={() => toggleRoutine(routine.id)}
                  className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start justify-between gap-3.5 ${
                    routine.completed
                      ? 'bg-zinc-50/70 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 opacity-70'
                      : isHighlight
                      ? 'bg-gradient-to-r from-emerald-50/90 to-teal-50/90 dark:from-emerald-950/40 dark:to-teal-950/40 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white dark:bg-zinc-850/60 border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                        routine.completed
                          ? 'bg-emerald-500 text-white'
                          : 'border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800'
                      }`}
                    >
                      {routine.completed && <CheckCircle2 className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                          {routine.timeSlot === 'MORNING'
                            ? '☀️ 아침'
                            : routine.timeSlot === 'HOMECOMING'
                            ? '🏡 귀가 후'
                            : '🌙 취침 전'}
                        </span>
                        {routine.warningBadge && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                            {routine.warningBadge}
                          </span>
                        )}
                        <h3
                          className={`text-sm font-bold text-zinc-900 dark:text-zinc-100 ${
                            routine.completed ? 'line-through text-zinc-400 dark:text-zinc-500' : ''
                          }`}
                        >
                          {routine.title}
                        </h3>
                      </div>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                        {routine.description}
                      </p>

                      {routine.productName && (
                        <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                          {routine.productName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Disclaimer Footer */}
      <footer className="max-w-4xl mx-auto w-full px-4 py-4 text-center border-t border-zinc-200/60 dark:border-zinc-800">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
          ⚠️ SkinClock의 안내는 일반적인 생활 습관 관리 참고용이며, 의학적 진단이나 처방을 대신하지 않습니다. 피부 이상 발생 시 전문의와 상담하세요.
        </p>
      </footer>
    </div>
  );
}
