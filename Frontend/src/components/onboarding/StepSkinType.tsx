import React from 'react';
import { SkinType } from '../../types/profile';
import { Droplet, Shield, Scale, HelpCircle, Flame, Check } from 'lucide-react';

interface StepSkinTypeProps {
  value: SkinType | null;
  onChange: (type: SkinType) => void;
}

interface SkinOption {
  type: SkinType;
  emoji: string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  borderColor: string;
}

const SKIN_OPTIONS: SkinOption[] = [
  {
    type: 'DRY',
    emoji: '🌵',
    title: '건성',
    subtitle: 'Dry Skin',
    badge: '수분 장벽 집중',
    description: '세안 후 얼굴 당김이 심하고, 유분과 수분이 모두 부족해 각질이 잘 일어나요.',
    icon: Flame,
    accentColor: 'from-amber-500/10 to-orange-500/5',
    borderColor: 'group-hover:border-amber-400 dark:group-hover:border-amber-500',
  },
  {
    type: 'OILY',
    emoji: '💧',
    title: '지성',
    subtitle: 'Oily Skin',
    badge: '모공·유분 컨트롤',
    description: '피지 분비가 왕성하여 얼굴이 쉽게 번들거리고 모공 케어가 필요해요.',
    icon: Droplet,
    accentColor: 'from-blue-500/10 to-cyan-500/5',
    borderColor: 'group-hover:border-blue-400 dark:group-hover:border-blue-500',
  },
  {
    type: 'COMBINATION',
    emoji: '⚖️',
    title: '복합성',
    subtitle: 'Combination',
    badge: '부위별 밸런스',
    description: '이마와 코(T존)는 번들거리고, 볼과 턱(U존)은 건조하거나 당김이 느껴져요.',
    icon: Scale,
    accentColor: 'from-emerald-500/10 to-teal-500/5',
    borderColor: 'group-hover:border-emerald-400 dark:group-hover:border-emerald-500',
  },
  {
    type: 'SENSITIVE',
    emoji: '🛡️',
    title: '민감성',
    subtitle: 'Sensitive',
    badge: '저자극 진정 케어',
    description: '기후 변화나 화장품 성분에 민감하여 쉽게 붉어지고 따가움을 느껴요.',
    icon: Shield,
    accentColor: 'from-rose-500/10 to-pink-500/5',
    borderColor: 'group-hover:border-rose-400 dark:group-hover:border-rose-500',
  },
  {
    type: 'UNKNOWN',
    emoji: '❓',
    title: '잘 모르겠음',
    subtitle: 'Not Sure (Recommended)',
    badge: '기본 밸런스 프로필',
    description: '내 피부 타입을 잘 모르겠어요. 초보자를 위한 가장 안전한 기본 루틴으로 시작합니다.',
    icon: HelpCircle,
    accentColor: 'from-violet-500/10 to-purple-500/5',
    borderColor: 'group-hover:border-violet-400 dark:group-hover:border-violet-500',
  },
];

export const StepSkinType: React.FC<StepSkinTypeProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <span>Q1. 고객님의 피부 타입을 알려주세요</span>
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
          피부 타입에 맞춰 날씨 및 자외선 강도에 따른 맞춤형 세안법과 기초 루틴을 추천해 드립니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        {SKIN_OPTIONS.map((option) => {
          const isSelected = value === option.type;
          const Icon = option.icon;

          return (
            <button
              key={option.type}
              type="button"
              onClick={() => onChange(option.type)}
              className={`group relative text-left p-4 rounded-2xl border transition-all duration-200 outline-none cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent dark:border-emerald-400 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                  : `border-zinc-200/80 bg-white hover:bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-850 ${option.borderColor}`
              } ${option.type === 'UNKNOWN' ? 'md:col-span-2' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 shadow-xs flex items-center justify-center">
                      {option.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                          {option.title}
                        </span>
                        <span className="text-xs text-zinc-400 dark:text-zinc-500 font-mono">
                          {option.subtitle}
                        </span>
                      </div>
                      <span className="inline-block mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        {option.badge}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-emerald-500 text-white scale-105 shadow-sm'
                        : 'border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-transparent'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400 leading-normal pl-0.5">
                  {option.description}
                </p>
              </div>

              {isSelected && (
                <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <Icon className="w-3.5 h-3.5" />
                  <span>선택됨 • 맞춤 케어 플랜이 적용됩니다</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-750 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2.5">
        <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          피부 타입은 언제든지 마이페이지 설정에서 변경할 수 있습니다.
        </span>
      </div>
    </div>
  );
};
