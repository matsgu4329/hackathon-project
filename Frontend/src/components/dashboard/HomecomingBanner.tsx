import React from 'react';
import { useSituationStore } from '../../stores/useSituationStore';
import { Home, X, Sparkles, CheckCircle2 } from 'lucide-react';

export const HomecomingBanner: React.FC = () => {
  const { homecomingToastActive, lastHomecomingTime, dismissHomecomingToast } =
    useSituationStore();

  if (!homecomingToastActive) return null;

  return (
    <div className="fixed top-18 right-4 sm:right-8 z-50 max-w-md w-[calc(100%-2rem)] p-4 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white shadow-2xl border border-emerald-400/40 animate-slide-down">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-white/20 shadow-xs shrink-0">
            <Home className="w-5 h-5 text-emerald-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-extrabold text-white tracking-tight">
                귀가를 감지했습니다! 🏡
              </h4>
              {lastHomecomingTime && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/20 text-emerald-100">
                  {lastHomecomingTime}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-100 mt-1 leading-snug">
              외출 후 얼굴에 남은 선크림과 미세먼지를 씻어낼 <strong>[귀가 세안 루틴]</strong>이 추천 목록 최상단에 활성화되었습니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={dismissHomecomingToast}
          className="p-1.5 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
