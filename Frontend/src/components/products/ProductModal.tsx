import React, { useState, useEffect } from 'react';
import {
  ProductRequest,
  ProductResponse,
  UsageStep,
  IngredientTag,
  CycleType,
  DayOfWeek,
} from '../../types/product';
import {
  X,
  Sparkles,
  Moon,
  AlertTriangle,
  Loader2,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: ProductRequest) => Promise<void>;
  editProduct?: ProductResponse | null;
}

const USAGE_STEPS: { value: UsageStep; label: string; emoji: string }[] = [
  { value: 'CLEANSING', label: '클렌징', emoji: '🧼' },
  { value: 'TONER', label: '토너/스킨', emoji: '🧴' },
  { value: 'ESSENCE_SERUM', label: '에센스/세럼', emoji: '🧪' },
  { value: 'CREAM', label: '크림/보습', emoji: '💧' },
  { value: 'SUNCARE', label: '선케어', emoji: '☀️' },
  { value: 'MASK_PACK', label: '팩/마스크', emoji: '🎭' },
  { value: 'OTHER', label: '기타 케어', emoji: '✨' },
];

const INGREDIENT_TAGS: { value: IngredientTag; label: string; isNight: boolean; desc: string }[] = [
  { value: 'RETINOL', label: '레티놀', isNight: true, desc: '주름/탄력 (🌙 밤 전용)' },
  { value: 'AHA_BHA', label: 'AHA/BHA', isNight: true, desc: '각질 정돈 (🌙 밤 전용)' },
  { value: 'VITAMIN_C', label: '비타민C', isNight: false, desc: '미백/항산화' },
  { value: 'CICA', label: '시카(병풀)', isNight: false, desc: '진정/장벽 회복' },
  { value: 'NEEDLE_SHOT', label: '니들샷', isNight: false, desc: '피부 침투 촉진' },
  { value: 'OTHER', label: '기타 성분', isNight: false, desc: '일반 보습/영양' },
];

const WEEKDAYS: { value: DayOfWeek; label: string }[] = [
  { value: 'MONDAY', label: '월' },
  { value: 'TUESDAY', label: '화' },
  { value: 'WEDNESDAY', label: '수' },
  { value: 'THURSDAY', label: '목' },
  { value: 'FRIDAY', label: '금' },
  { value: 'SATURDAY', label: '토' },
  { value: 'SUNDAY', label: '일' },
];

const POPULAR_PRESETS = [
  '레티놀 0.1% 탄력 세럼',
  '시카 판테놀 진정 수분크림',
  '약산성 마일드 클렌징 폼',
  'SPF50+ 무기자차 선크림',
  '히알루론산 수분 진정 마스크팩',
];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editProduct,
}) => {
  const [name, setName] = useState('');
  const [usageStep, setUsageStep] = useState<UsageStep>('CREAM');
  const [ingredientTags, setIngredientTags] = useState<IngredientTag[]>([]);
  const [cycleType, setCycleType] = useState<CycleType>('DAILY');
  const [cycleIntervalDays, setCycleIntervalDays] = useState<number>(3);
  const [cycleWeekdays, setCycleWeekdays] = useState<DayOfWeek[]>(['MONDAY', 'THURSDAY']);
  const [lastUsedAt, setLastUsedAt] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset on modal open
  useEffect(() => {
    if (editProduct) {
      setName(editProduct.name);
      setUsageStep(editProduct.usageStep);
      setIngredientTags(editProduct.ingredientTags || []);
      setCycleType(editProduct.cycleType);
      setCycleIntervalDays(editProduct.cycleIntervalDays || 3);
      setCycleWeekdays(editProduct.cycleWeekdays || ['MONDAY', 'THURSDAY']);
      setLastUsedAt(editProduct.lastUsedAt || new Date().toISOString().split('T')[0]);
    } else {
      setName('');
      setUsageStep('CREAM');
      setIngredientTags([]);
      setCycleType('DAILY');
      setCycleIntervalDays(3);
      setCycleWeekdays(['MONDAY', 'THURSDAY']);
      setLastUsedAt(new Date().toISOString().split('T')[0]);
    }
    setError(null);
  }, [editProduct, isOpen]);

  if (!isOpen) return null;

  const isNightSensitive =
    ingredientTags.includes('RETINOL') || ingredientTags.includes('AHA_BHA');

  const toggleIngredient = (tag: IngredientTag) => {
    if (ingredientTags.includes(tag)) {
      setIngredientTags(ingredientTags.filter((t) => t !== tag));
    } else {
      setIngredientTags([...ingredientTags, tag]);
    }
  };

  const toggleWeekday = (day: DayOfWeek) => {
    if (cycleWeekdays.includes(day)) {
      if (cycleWeekdays.length === 1) {
        setError('최소 1개 이상의 요일을 선택해야 합니다.');
        return;
      }
      setCycleWeekdays(cycleWeekdays.filter((d) => d !== day));
    } else {
      setCycleWeekdays([...cycleWeekdays, day]);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('제품명을 입력해 주세요.');
      return;
    }

    if (cycleType === 'EVERY_N_DAYS' && (!cycleIntervalDays || cycleIntervalDays < 1)) {
      setError('사용 주기는 1일 이상이어야 합니다.');
      return;
    }

    if (cycleType === 'SPECIFIC_WEEKDAYS' && cycleWeekdays.length === 0) {
      setError('요일을 최소 1개 이상 선택해 주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    const payload: ProductRequest = {
      name: name.trim(),
      usageStep,
      ingredientTags,
      cycleType,
      cycleIntervalDays: cycleType === 'EVERY_N_DAYS' ? Number(cycleIntervalDays) : null,
      cycleWeekdays: cycleType === 'SPECIFIC_WEEKDAYS' ? cycleWeekdays : null,
      lastUsedAt: lastUsedAt || null,
    };

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
      setError(err instanceof Error ? err.message : '제품 저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {editProduct ? '보유 제품 수정' : '새 스킨케어 제품 등록'}
              </h2>
              <p className="text-xs text-zinc-500">화장품의 사용 단계와 주기, 성분을 등록하세요</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/60 text-xs font-medium text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name & Suggestions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-1.5">
              제품명 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: B사 레티놀 0.1% 탄력 세럼"
              className="w-full h-11 px-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {/* Quick preset chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="text-[11px] text-zinc-400 self-center mr-1">추천 예시:</span>
              {POPULAR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setName(preset)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-600 dark:text-zinc-400 transition-colors cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Usage Step */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 mb-2">
              사용 단계 <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {USAGE_STEPS.map((step) => {
                const isSelected = usageStep === step.value;
                return (
                  <button
                    key={step.value}
                    type="button"
                    onClick={() => setUsageStep(step.value)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-600 ring-1 ring-emerald-500/30'
                        : 'border-zinc-200 dark:border-zinc-750 bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                    }`}
                  >
                    <span>{step.emoji}</span>
                    <span>{step.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ingredient Tags (Multi-select) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                주요 성분 및 기능 태그
              </label>
              <span className="text-[11px] text-zinc-400">다중 선택 가능</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {INGREDIENT_TAGS.map((tag) => {
                const isSelected = ingredientTags.includes(tag.value);
                return (
                  <button
                    key={tag.value}
                    type="button"
                    onClick={() => toggleIngredient(tag.value)}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      isSelected
                        ? tag.isNight
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 ring-1 ring-indigo-500/40'
                          : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 ring-1 ring-emerald-500/40'
                        : 'border-zinc-200 dark:border-zinc-750 bg-white dark:bg-zinc-800/40 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{tag.label}</span>
                      {tag.isNight && <Moon className="w-3 h-3 text-indigo-500" />}
                    </div>
                    <span className="text-[10px] text-zinc-400 block mt-0.5">{tag.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Smart Badge Notice (Docs/frontend.md spec) */}
            {isNightSensitive && (
              <div className="mt-3 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5 animate-fade-in">
                <Moon className="w-4 h-4 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>🌙 스마트 성분 감지:</strong> 선택하신{' '}
                  <span className="font-bold underline">레티놀 / AHA·BHA</span> 성분은 자외선에 민감하므로 자동으로 <strong>[밤 전용 (nightOnly: true)]</strong>으로 분류되어 아침 추천에서 제외됩니다.
                </div>
              </div>
            )}
          </div>

          {/* Usage Cycle Configuration */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 space-y-3.5">
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block">
              사용 주기 설정
            </label>

            {/* Cycle Type 3 buttons */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: 'DAILY', label: '매일' },
                { type: 'EVERY_N_DAYS', label: 'N일에 1번' },
                { type: 'SPECIFIC_WEEKDAYS', label: '특정 요일' },
              ].map(({ type, label }) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCycleType(type as CycleType)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    cycleType === type
                      ? 'border-emerald-500 bg-white dark:bg-zinc-800 text-emerald-700 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500/30'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Cycle details */}
            {cycleType === 'EVERY_N_DAYS' && (
              <div className="flex items-center gap-3 pt-1">
                <span className="text-xs text-zinc-600 dark:text-zinc-400">사용 주기 간격:</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={cycleIntervalDays}
                  onChange={(e) => setCycleIntervalDays(Number(e.target.value))}
                  className="w-20 h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-center font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">일에 1번 사용</span>
              </div>
            )}

            {cycleType === 'SPECIFIC_WEEKDAYS' && (
              <div className="pt-1">
                <span className="text-[11px] text-zinc-500 block mb-2">사용할 요일을 선택하세요:</span>
                <div className="grid grid-cols-7 gap-1.5">
                  {WEEKDAYS.map((w) => {
                    const isSelected = cycleWeekdays.includes(w.value);
                    return (
                      <button
                        key={w.value}
                        type="button"
                        onClick={() => toggleWeekday(w.value)}
                        className={`h-9 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {w.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Last Used At */}
            <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-750 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>최근 사용일</span>
              </span>
              <input
                type="date"
                value={lastUsedAt}
                onChange={(e) => setLastUsedAt(e.target.value)}
                className="h-9 px-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>저장 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editProduct ? '수정 완료' : '제품 등록하기'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
