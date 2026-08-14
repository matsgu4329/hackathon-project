import React, { useState } from 'react';
import { DailyRecommendation, TimeSlot } from '../../types/recommendation';
import { useSituationStore } from '../../stores/useSituationStore';
import {
  Sparkles,
  CheckCircle2,
  Moon,
  Sun,
  Home,
  Check,
} from 'lucide-react';

interface RoutineChecklistProps {
  recommendation: DailyRecommendation;
}

const SLOT_LABEL_MAP: Record<
  TimeSlot,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  MORNING: { label: '아침 모닝 케어', icon: Sun, color: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60' },
  HOMECOMING: { label: '귀가 후 세안 케어', icon: Home, color: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60' },
  NIGHT: { label: '취침 전 나이트 케어', icon: Moon, color: 'text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60' },
};

export const RoutineChecklist: React.FC<RoutineChecklistProps> = ({ recommendation }) => {
  const { currentLocationState } = useSituationStore();
  const [completedIds, setCompletedIds] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setCompletedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const steps = recommendation.steps || [];

  // When location is HOME, prioritize homecoming routines at top
  const sortedSteps = [...steps].sort((a, b) => {
    if (currentLocationState === 'HOME') {
      if (a.timeSlot === 'HOMECOMING' && b.timeSlot !== 'HOMECOMING') return -1;
      if (a.timeSlot !== 'HOMECOMING' && b.timeSlot === 'HOMECOMING') return 1;
    }
    return a.stepOrder - b.stepOrder;
  });

  const completedCount = steps.filter((s) => completedIds[String(s.id)]).length;
  const totalCount = steps.length;
  const progressRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 rounded-3xl bg-white/95 dark:bg-zinc-900/95 border border-zinc-200/80 dark:border-zinc-800 shadow-md space-y-5">
      {/* Header & Progress */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              오늘의 맞춤 추천 루틴 체크리스트
            </h2>
          </div>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            자외선 지수와 귀가 상태에 맞춘 추천 액션을 수행하고 체크하세요
          </p>
        </div>

        {/* Progress Display */}
        <div className="w-36 text-right">
          <div className="flex items-center justify-end gap-1.5 text-xs font-bold font-mono">
            <span className="text-emerald-700 dark:text-emerald-400 text-sm">{progressRate}%</span>
            <span className="text-zinc-500 dark:text-zinc-400 font-medium">({completedCount}/{totalCount} 완료)</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full mt-1.5 overflow-hidden p-0.5 border border-zinc-200/60 dark:border-zinc-700/60">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-300 shadow-xs"
              style={{ width: `${progressRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Homecoming Notice Banner if HOME */}
      {currentLocationState === 'HOME' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/70 dark:via-teal-950/70 dark:to-emerald-950/70 border border-emerald-300 dark:border-emerald-700/80 flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-100">
                🏡 귀가 상태 감지됨!
              </span>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-200 mt-0.5">
                외출 중 흡착된 미세먼지와 선크림을 씻어낼 귀가 세안 카드가 최상단에 배치되었습니다.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-600 text-white shrink-0">
            우선 추천
          </span>
        </div>
      )}

      {/* Steps List */}
      <div className="space-y-3">
        {sortedSteps.map((step) => {
          const stepId = String(step.id);
          const isDone = Boolean(completedIds[stepId]);
          const slot = SLOT_LABEL_MAP[step.timeSlot] || SLOT_LABEL_MAP.MORNING;
          const SlotIcon = slot.icon;
          const isHomeBoosted = step.timeSlot === 'HOMECOMING' && currentLocationState === 'HOME';

          return (
            <div
              key={stepId}
              onClick={() => toggleStep(stepId)}
              className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start justify-between gap-3.5 ${
                isDone
                  ? 'bg-emerald-50/30 dark:bg-emerald-950/15 border-emerald-300/70 dark:border-emerald-800/50'
                  : isHomeBoosted
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white dark:bg-zinc-850/80 border-zinc-200 dark:border-zinc-750 hover:border-emerald-400 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1">
                {/* Checkbox Button */}
                <button
                  type="button"
                  className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-xs scale-105'
                      : 'border-2 border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:border-emerald-500'
                  }`}
                >
                  {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    {/* TimeSlot Tag */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border border-zinc-200/60 dark:border-zinc-700/60 ${slot.color}`}
                    >
                      <SlotIcon className="w-3 h-3" />
                      <span>{slot.label}</span>
                    </span>

                    {/* Night Only Tag */}
                    {step.warningBadge && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {step.warningBadge}
                      </span>
                    )}

                    {isHomeBoosted && !isDone && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                        지금 추천
                      </span>
                    )}

                    {isDone && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ✓ 실천 완료
                      </span>
                    )}
                  </div>

                  {/* Title - clearly readable in both checked and unchecked states */}
                  <h3
                    className={`text-sm font-bold leading-snug transition-colors ${
                      isDone
                        ? 'text-zinc-700 dark:text-zinc-300 line-through decoration-emerald-500/70 decoration-2'
                        : 'text-zinc-900 dark:text-zinc-50'
                    }`}
                  >
                    {step.description}
                  </h3>

                  {step.cleansingGuide && (
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isDone
                          ? 'text-zinc-500 dark:text-zinc-400'
                          : 'text-zinc-600 dark:text-zinc-300 font-medium'
                      }`}
                    >
                      💡 {step.cleansingGuide}
                    </p>
                  )}

                  {step.productName && (
                    <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
                      {step.productName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
