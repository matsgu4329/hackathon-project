import React from 'react';
import { SkinType, OutingPatternType } from '../../types/profile';
import { Sparkles, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';

interface StepSummaryProps {
  skinType: SkinType;
  outingPatternType: OutingPatternType;
  outingStartTime: string;
  outingEndTime: string;
  preferredNotificationTime: string;
  baseRoutineItems: string[];
}

const SKIN_NAME_MAP: Record<SkinType, { name: string; emoji: string; desc: string }> = {
  DRY: { name: '건성 피부', emoji: '🌵', desc: '고보습 장벽 강화 및 순한 약산성 세안' },
  OILY: { name: '지성 피부', emoji: '💧', desc: '모공 정화, 피지 밸런스 및 산뜻 보습' },
  COMBINATION: { name: '복합성 피부', emoji: '⚖️', desc: 'T존 유분 관리 & U존 수분 충전 듀얼 케어' },
  SENSITIVE: { name: '민감성 피부', emoji: '🛡️', desc: '저자극 진정 앰플 및 무자극 클렌징' },
  UNKNOWN: { name: '기본 밸런스 프로필', emoji: '❓', desc: '모든 피부에 안전한 표준 유수분 밸런스 케어' },
};

export const StepSummary: React.FC<StepSummaryProps> = ({
  skinType,
  outingPatternType,
  outingStartTime,
  outingEndTime,
  preferredNotificationTime,
  baseRoutineItems,
}) => {
  const skinInfo = SKIN_NAME_MAP[skinType] || SKIN_NAME_MAP.UNKNOWN;

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>모든 준비가 완료되었습니다!</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          설정하신 피부 시계 프로필을 확인해주세요
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
          아래 설정에 따라 실시간 날씨와 자외선 지수를 반영한 데일리 스킨케어 스케줄이 생성됩니다.
        </p>
      </div>

      {/* Summary Profile Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-emerald-50/20 to-teal-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 border border-emerald-500/30 dark:border-emerald-500/20 shadow-xl space-y-5">
        {/* Skin Type Row */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-3.5">
            <span className="text-3xl p-2.5 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm border border-zinc-200/60 dark:border-zinc-700">
              {skinInfo.emoji}
            </span>
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-medium">피부 타입</span>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {skinInfo.name}
              </h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                {skinInfo.desc}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-white">
            설정됨
          </span>
        </div>

        {/* Schedule & Pattern */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-750">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              <span>외출 라이프스타일</span>
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {outingPatternType === 'REGULAR' ? '규칙적인 외출' : '유동적 / 프리랜서'}
            </p>
            {outingPatternType === 'REGULAR' && (
              <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mt-1">
                외출 {outingStartTime} ~ 귀가 {outingEndTime}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-zinc-800/60 border border-zinc-200/60 dark:border-zinc-750">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>아침 브리핑 알림</span>
            </div>
            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              매일 아침 {preferredNotificationTime}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              오늘의 날씨·UV & 선크림 가이드
            </p>
          </div>
        </div>

        {/* Base Products */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              기본 스킨케어 품목 ({baseRoutineItems.length}개)
            </span>
          </div>
          {baseRoutineItems.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {baseRoutineItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{item}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-zinc-400 italic">선택된 품목 없음 (기본 추천 제품군 적용)</p>
          )}
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-900 dark:text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <p className="leading-relaxed">
          <strong>안내</strong>: 완료 버튼을 누르면 설정이 저장되며, 현재 위치의 실시간 기상 데이터(자외선, 습도)와 결합된 첫 번째 루틴 대시보드로 이동합니다.
        </p>
      </div>
    </div>
  );
};
