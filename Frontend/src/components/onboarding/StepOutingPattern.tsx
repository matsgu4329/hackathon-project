import React from 'react';
import { OutingPatternType } from '../../types/profile';
import { Clock, Briefcase, Coffee, BellRing, Sun, Home, Check } from 'lucide-react';

interface StepOutingPatternProps {
  patternType: OutingPatternType | null;
  outingStartTime: string;
  outingEndTime: string;
  preferredNotificationTime: string;
  onChangePattern: (type: OutingPatternType) => void;
  onChangeStartTime: (time: string) => void;
  onChangeEndTime: (time: string) => void;
  onChangeNotificationTime: (time: string) => void;
}

const TIME_OPTIONS = [
  '06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
  '20:30', '21:00', '21:30', '22:00', '22:30', '23:00'
];

export const StepOutingPattern: React.FC<StepOutingPatternProps> = ({
  patternType,
  outingStartTime,
  outingEndTime,
  preferredNotificationTime,
  onChangePattern,
  onChangeStartTime,
  onChangeEndTime,
  onChangeNotificationTime,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Q2. 생활 패턴 및 알림 시간을 설정해주세요
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
          외출 시간대와 귀가 시간에 맞춰 자외선 차단 및 딥클렌징 타이밍을 스마트하게 알려드립니다.
        </p>
      </div>

      {/* Outing Pattern Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
          외출 라이프스타일
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Regular */}
          <button
            type="button"
            onClick={() => onChangePattern('REGULAR')}
            className={`group text-left p-4 rounded-2xl border transition-all duration-200 outline-none cursor-pointer flex flex-col justify-between ${
              patternType === 'REGULAR'
                ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:border-emerald-400 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                : 'border-zinc-200/80 bg-white hover:bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-850'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                    <Briefcase className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      규칙적인 외출
                    </h3>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      출퇴근 / 등하교 등 고정된 일과
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    patternType === 'REGULAR'
                      ? 'bg-emerald-500 text-white scale-105'
                      : 'border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                정해진 출근/등교 시간과 퇴근/귀가 시간에 맞춰 세안 및 케어 브리핑을 전송합니다.
              </p>
            </div>
          </button>

          {/* Irregular */}
          <button
            type="button"
            onClick={() => onChangePattern('IRREGULAR')}
            className={`group text-left p-4 rounded-2xl border transition-all duration-200 outline-none cursor-pointer flex flex-col justify-between ${
              patternType === 'IRREGULAR'
                ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:border-emerald-400 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                : 'border-zinc-200/80 bg-white hover:bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-850'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
                    <Coffee className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                      유동적 / 불규칙
                    </h3>
                    <span className="text-xs text-zinc-400 dark:text-zinc-500">
                      재택근무, 프리랜서, 교대근무 등
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    patternType === 'IRREGULAR'
                      ? 'bg-emerald-500 text-white scale-105'
                      : 'border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-transparent'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 leading-normal">
                정해진 시간 없이 앱 대시보드의 '귀가 모의 입력' 및 실시간 자외선 지수에 따라 반응합니다.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Time Pickers Section */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-4">
        {patternType === 'REGULAR' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            {/* Outing Start Time */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>외출 시작 시각 (출근/등교)</span>
              </label>
              <div className="relative">
                <select
                  value={outingStartTime}
                  onChange={(e) => onChangeStartTime(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <Clock className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Outing End Time (Homecoming) */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
                <Home className="w-3.5 h-3.5 text-blue-500" />
                <span>귀가 예정 시각 (퇴근/하교)</span>
              </label>
              <div className="relative">
                <select
                  value={outingEndTime}
                  onChange={(e) => onChangeEndTime(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
                >
                  {TIME_OPTIONS.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
                <Clock className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>
          </div>
        )}

        {/* Preferred Notification Time */}
        <div>
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 mb-2">
            <BellRing className="w-3.5 h-3.5 text-emerald-500" />
            <span>아침 브리핑 & 날씨 리마인더 희망 시각</span>
          </label>
          <div className="relative max-w-sm">
            <select
              value={preferredNotificationTime}
              onChange={(e) => onChangeNotificationTime(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
            >
              {TIME_OPTIONS.map((time) => (
                <option key={time} value={time}>
                  {time} (아침 스킨케어 브리핑)
                </option>
              ))}
            </select>
            <Clock className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
            💡 당일 자외선 지수(UV)와 기온/습도에 맞춘 외출 전 루틴 가이드가 이 시간에 도착합니다.
          </p>
        </div>
      </div>
    </div>
  );
};
