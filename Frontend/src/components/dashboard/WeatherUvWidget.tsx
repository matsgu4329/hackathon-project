import React, { useState } from 'react';
import { useSituationStore } from '../../stores/useSituationStore';
import { SkinType } from '../../types/profile';
import {
  Sun,
  CloudRain,
  Wind,
  Droplets,
  RefreshCw,
  Shield,
  Sparkles,
} from 'lucide-react';

interface WeatherUvWidgetProps {
  skinType?: SkinType | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const WeatherUvWidget: React.FC<WeatherUvWidgetProps> = ({
  skinType,
  onRefresh,
  isRefreshing = false,
}) => {
  const { mockUvIndex, mockWeather } = useSituationStore();
  const [updatedAt, setUpdatedAt] = useState<string>('방금 전 갱신됨');

  // Dynamic UV Info
  const getUvDetails = (uv: number) => {
    if (uv <= 2) {
      return {
        level: '안전',
        badgeColor: 'bg-emerald-500 text-white',
        borderGlow: 'border-emerald-500/30 dark:border-emerald-500/20',
        bgGradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
        tip: '자외선 지수가 낮아 실외 활동 시 피부 자극 우려가 적습니다. 일상적인 보습을 유지하세요.',
      };
    } else if (uv <= 5) {
      return {
        level: '보통',
        badgeColor: 'bg-amber-500 text-white',
        borderGlow: 'border-amber-500/30 dark:border-amber-500/20',
        bgGradient: 'from-amber-500/10 via-orange-500/5 to-transparent',
        tip: '자외선 차단제(SPF30+)를 외출 30분 전에 펴 바르고, 장시간 야외 활동 시 모자를 착용하세요.',
      };
    } else if (uv <= 8) {
      return {
        level: '높음',
        badgeColor: 'bg-orange-600 text-white animate-pulse',
        borderGlow: 'border-orange-500/40 dark:border-orange-500/30',
        bgGradient: 'from-orange-500/15 via-amber-500/5 to-transparent',
        tip: '자외선이 강합니다! SPF50+ PA++++ 선크림을 필수 사용하고, 2~3시간마다 덧발라주세요.',
      };
    } else {
      return {
        level: '매우 높음 (위험)',
        badgeColor: 'bg-rose-600 text-white animate-pulse',
        borderGlow: 'border-rose-500/50 dark:border-rose-500/40',
        bgGradient: 'from-rose-500/20 via-orange-500/10 to-transparent',
        tip: '햇볕이 매우 강렬합니다. 한낮 외출을 자제하고 긴소매 옷과 자외선 차단제를 필수로 챙기세요!',
      };
    }
  };

  // Weather Details
  const getWeatherDetails = (weather: 'CLEAR' | 'RAIN' | 'DRY') => {
    switch (weather) {
      case 'RAIN':
        return {
          icon: CloudRain,
          label: '비 / 고습도 (습도 85%)',
          color: 'text-blue-500',
          skinTip: '습한 날씨로 인해 피지 분비가 늘어날 수 있으니 산뜻한 젤 타입 수분크림을 추천합니다.',
        };
      case 'DRY':
        return {
          icon: Wind,
          label: '건조 / 바람 (습도 35%)',
          color: 'text-amber-500',
          skinTip: '건조한 대기로 피부 수분 증발이 빠릅니다. 히알루론산 토너와 세라마이드 보습제를 덧발라주세요.',
        };
      default:
        return {
          icon: Sun,
          label: '맑음 (습도 60%)',
          color: 'text-amber-500',
          skinTip: '유수분 밸런스가 안정적입니다. 기본 보습과 자외선 차단에 집중하세요.',
        };
    }
  };

  const uvDetails = getUvDetails(mockUvIndex);
  const weatherDetails = getWeatherDetails(mockWeather);
  const WeatherIcon = weatherDetails.icon;

  const handleManualRefresh = () => {
    setUpdatedAt('방금 전 갱신됨');
    if (onRefresh) onRefresh();
  };

  return (
    <div
      className={`rounded-3xl p-6 border bg-gradient-to-br ${uvDetails.bgGradient} bg-white dark:bg-zinc-900 ${uvDetails.borderGlow} shadow-lg transition-all space-y-5`}
    >
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
            📍 서울시 마포구 기상 관측소
          </span>
          <span className="text-xs text-zinc-400 font-mono">• {updatedAt}</span>
        </div>

        <div className="flex items-center gap-2">
          {skinType && (
            <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>피부 타입: {skinType}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-750 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-all cursor-pointer"
            title="날씨 데이터 새로고침"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* UV Index Stat */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-zinc-200/60 dark:border-zinc-750 shadow-xs flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-sm shrink-0">
            <Sun className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">자외선 지수 (UV)</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${uvDetails.badgeColor}`}>
                UV {mockUvIndex} ({uvDetails.level})
              </span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1.5 leading-snug font-medium">
              {uvDetails.tip}
            </p>
          </div>
        </div>

        {/* Weather & Moisture Stat */}
        <div className="p-4 rounded-2xl bg-white/80 dark:bg-zinc-850/80 border border-zinc-200/60 dark:border-zinc-750 shadow-xs flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-500 text-white shadow-sm shrink-0">
            <WeatherIcon className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">환경 & 습도</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                {weatherDetails.label}
              </span>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 mt-1.5 leading-snug font-medium">
              {weatherDetails.skinTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
