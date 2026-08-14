import React, { useState } from 'react';
import { Sparkles, Plus, Check, Trash2, HelpCircle } from 'lucide-react';

interface StepBaseRoutineProps {
  selectedItems: string[];
  onChangeItems: (items: string[]) => void;
}

interface RoutinePreset {
  id: string;
  name: string;
  emoji: string;
  tag: string;
  desc: string;
}

const PRESET_CATEGORIES: RoutinePreset[] = [
  { id: '클렌징폼', name: '클렌징 폼 / 젤', emoji: '🧼', tag: '필수 세안', desc: '노폐물과 선크림 세정' },
  { id: '수분크림', name: '수분 / 보습 크림', emoji: '💧', tag: '보습 장벽', desc: '유수분 균형 유지' },
  { id: '자외선차단제', name: '자외선 차단제 (선크림)', emoji: '☀️', tag: '자외선 방어', desc: '광노화 및 피부 보호' },
  { id: '토너/스킨', name: '토너 / 스킨 / 패드', emoji: '🧴', tag: '결 정돈', desc: '세안 직후 수분 공급' },
  { id: '에센스/세럼', name: '에센스 / 세럼 / 앰플', emoji: '🧪', tag: '기능성 케어', desc: '진정, 비타민, 모공 집중' },
  { id: '마스크팩', name: '마스크팩 / 진정 팩', emoji: '🎭', tag: '주기성 케어', desc: '주 1~2회 집중 진정' },
  { id: '아이크림', name: '아이크림 / 넥크림', emoji: '👁️', tag: '국소 케어', desc: '눈가 및 얇은 피부 보호' },
  { id: '스팟/진정', name: '스팟 패치 / 시카 밤', emoji: '🌿', tag: '트러블 응급', desc: '뾰루지 및 붉은 기 진정' },
];

const ESSENTIAL_TRIO = ['클렌징폼', '수분크림', '자외선차단제'];

export const StepBaseRoutine: React.FC<StepBaseRoutineProps> = ({
  selectedItems,
  onChangeItems,
}) => {
  const [customInput, setCustomInput] = useState('');

  const toggleItem = (name: string) => {
    if (selectedItems.includes(name)) {
      onChangeItems(selectedItems.filter((i) => i !== name));
    } else {
      onChangeItems([...selectedItems, name]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!selectedItems.includes(trimmed)) {
      onChangeItems([...selectedItems, trimmed]);
    }
    setCustomInput('');
  };

  const selectEssentialTrio = () => {
    const combined = Array.from(new Set([...selectedItems, ...ESSENTIAL_TRIO]));
    onChangeItems(combined);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Q3. 현재 사용 중이거나 보유한 스킨케어 품목을 선택해주세요
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1.5 leading-relaxed">
          가지고 계신 제품들을 기반으로 과하지 않고 실천하기 쉬운 일일 루틴을 조합해 드립니다.
        </p>
      </div>

      {/* Quick Action Preset */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-cyan-500/10 border border-emerald-500/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            초보자 추천: 세안 + 보습 + 자외선차단 3종
          </span>
        </div>
        <button
          type="button"
          onClick={selectEssentialTrio}
          className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-emerald-950 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 transition-all cursor-pointer shadow-xs"
        >
          + 필수 3종 1초 담기
        </button>
      </div>

      {/* Preset Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESET_CATEGORIES.map((cat) => {
          const isSelected = selectedItems.includes(cat.id);

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleItem(cat.id)}
              className={`text-left p-3.5 rounded-xl border transition-all duration-150 outline-none cursor-pointer flex items-center justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-zinc-900 dark:text-zinc-50 ring-1 ring-emerald-500/40'
                  : 'border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                  {cat.emoji}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-sm">{cat.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                      {cat.tag}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {cat.desc}
                  </span>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white'
                    : 'border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-transparent'
                }`}
              >
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom item addition */}
      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
          목록에 없는 제품 직접 추가하기
        </label>
        <form onSubmit={handleAddCustom} className="flex gap-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="예: 레티놀 세럼, 모델링 팩, 립밤 등"
            className="flex-1 h-10 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!customInput.trim()}
            className="px-4 h-10 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>추가</span>
          </button>
        </form>

        {/* Selected Items summary chips */}
        {selectedItems.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-1.5">
              선택된 품목 ({selectedItems.length}개):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {selectedItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => toggleItem(item)}
                    className="p-0.5 text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-100"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-850/60 border border-zinc-200/60 dark:border-zinc-750 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-2.5">
        <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>
          선택하지 않은 화장품이라도 추천 루틴에서 가이드를 확인하고 추후 &apos;보유 제품 관리&apos;에서 언제든지 추가할 수 있습니다.
        </span>
      </div>
    </div>
  );
};
