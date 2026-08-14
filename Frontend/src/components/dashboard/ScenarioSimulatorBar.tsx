import React from 'react';
import { useSituationStore } from '../../stores/useSituationStore';
import { useNotifications } from '../../hooks/queries/useNotifications';
import {
  Home,
  Sun,
  CloudRain,
  Wind,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const ScenarioSimulatorBar: React.FC = () => {
  const {
    currentLocationState,
    mockUvIndex,
    mockWeather,
    setMockUvIndex,
    setMockWeather,
    setCurrentLocationState,
    resetSimulation,
  } = useSituationStore();

  const { triggerHomecoming, isTriggeringHomecoming } = useNotifications();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="w-full rounded-3xl bg-zinc-900 text-white border border-zinc-800 shadow-xl overflow-hidden transition-all">
      {/* Top bar header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-950/70 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase border border-emerald-500/30">
            MVP Demo Simulator
          </span>
          <h2 className="text-xs font-bold tracking-tight text-zinc-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>상황 인지 시뮬레이터 (FE PRD 4.1절)</span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline-block">
            상태: {currentLocationState === 'OUTDOOR' ? '🚗 외출 중' : '🏠 귀가 완료'} | UV {mockUvIndex}
          </span>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            title={collapsed ? '펼치기' : '접기'}
          >
            {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Simulator Controls Body */}
      {!collapsed && (
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Homecoming Button */}
            <button
              type="button"
              onClick={() => triggerHomecoming()}
              disabled={isTriggeringHomecoming}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer ${
                currentLocationState === 'HOME'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-400/50 shadow-emerald-600/30'
                  : 'bg-emerald-700 hover:bg-emerald-600 text-white shadow-emerald-800/30'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>🏠 [시연] 귀가 모의 입력</span>
            </button>

            {/* Outdoor Mode Button */}
            <button
              type="button"
              onClick={() => setCurrentLocationState('OUTDOOR')}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentLocationState === 'OUTDOOR'
                  ? 'bg-zinc-700 text-white border border-zinc-600'
                  : 'bg-zinc-800 hover:bg-zinc-750 text-zinc-400 border border-zinc-750'
              }`}
            >
              🚗 외출 모드로 전환
            </button>

            {/* UV Index Selector Buttons */}
            <div className="flex items-center gap-1.5 bg-zinc-800/90 px-3 py-1.5 rounded-xl border border-zinc-700/80">
              <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs text-zinc-300 font-medium mr-1">UV 변경:</span>
              {[
                { val: 2, label: '2 (안전)' },
                { val: 7, label: '7 (높음)' },
                { val: 11, label: '11+ (위험)' },
              ].map(({ val, label }) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setMockUvIndex(val)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    mockUvIndex === val
                      ? val >= 8
                        ? 'bg-rose-500 text-white shadow-xs'
                        : val >= 6
                        ? 'bg-amber-500 text-black shadow-xs'
                        : 'bg-emerald-500 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Weather Condition Selector */}
            <div className="flex items-center gap-1.5 bg-zinc-800/90 px-3 py-1.5 rounded-xl border border-zinc-700/80">
              <span className="text-xs text-zinc-300 font-medium mr-1">날씨:</span>
              {[
                { type: 'CLEAR', icon: Sun, label: '맑음' },
                { type: 'RAIN', icon: CloudRain, label: '비/습함' },
                { type: 'DRY', icon: Wind, label: '건조' },
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMockWeather(type as 'CLEAR' | 'RAIN' | 'DRY')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                    mockWeather === type
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={resetSimulation}
              className="ml-auto p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
              title="시뮬레이터 초기화"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-zinc-400 leading-normal">
            💡 <strong>시연 안내</strong>: 위 툴바에서 <strong>[귀가 모의 입력]</strong>을 누르면 실시간 백엔드 호출 없이도 귀가 세안 알림 팝업 및 대시보드 추천 루틴 전환을 1초 만에 테스트할 수 있습니다.
          </p>
        </div>
      )}
    </div>
  );
};
