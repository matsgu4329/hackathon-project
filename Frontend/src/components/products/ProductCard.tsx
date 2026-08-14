import React from 'react';
import { ProductResponse, UsageStep, IngredientTag } from '../../types/product';
import {
  Moon,
  Sparkles,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ProductCardProps {
  product: ProductResponse;
  onEdit: (product: ProductResponse) => void;
  onDelete: (id: number, name: string) => void;
  onMarkUsedToday?: (product: ProductResponse) => void;
}

const USAGE_STEP_CONFIG: Record<
  UsageStep,
  { label: string; emoji: string; color: string }
> = {
  CLEANSING: { label: '클렌징', emoji: '🧼', color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300' },
  TONER: { label: '토너/스킨', emoji: '🧴', color: 'bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300' },
  ESSENCE_SERUM: { label: '에센스/세럼', emoji: '🧪', color: 'bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300' },
  CREAM: { label: '크림/보습', emoji: '💧', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' },
  SUNCARE: { label: '선케어', emoji: '☀️', color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300' },
  MASK_PACK: { label: '팩/마스크', emoji: '🎭', color: 'bg-pink-50 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300' },
  OTHER: { label: '기타 케어', emoji: '✨', color: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
};

const INGREDIENT_LABEL_MAP: Record<IngredientTag, string> = {
  RETINOL: '레티놀',
  AHA_BHA: 'AHA/BHA',
  VITAMIN_C: '비타민C',
  CICA: '시카(진정)',
  NEEDLE_SHOT: '니들샷',
  OTHER: '기타 성분',
};

const WEEKDAY_LABEL_MAP: Record<string, string> = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onEdit,
  onDelete,
  onMarkUsedToday,
}) => {
  const stepInfo = USAGE_STEP_CONFIG[product.usageStep] || USAGE_STEP_CONFIG.OTHER;
  const isNightOnly = product.nightOnly;

  // Format cycle description
  const getCycleText = () => {
    switch (product.cycleType) {
      case 'DAILY':
        return '매일 사용';
      case 'EVERY_N_DAYS':
        return `${product.cycleIntervalDays || 1}일에 1번`;
      case 'SPECIFIC_WEEKDAYS': {
        const days = (product.cycleWeekdays || [])
          .map((d) => WEEKDAY_LABEL_MAP[d] || d)
          .join(', ');
        return `주 ${product.cycleWeekdays?.length || 0}회 (${days || '지정 없음'})`;
      }
      default:
        return '사용 주기 미지정';
    }
  };

  // Calculate D-Day for nextUseDate
  const getNextUseBadge = () => {
    if (!product.nextUseDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextDate = new Date(product.nextUseDate);
    nextDate.setHours(0, 0, 0, 0);

    const diffDays = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return {
        text: '오늘 사용',
        color: 'bg-emerald-500 text-white font-bold animate-pulse',
        isToday: true,
      };
    } else if (diffDays === 1) {
      return {
        text: '내일 (D-1)',
        color: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-semibold',
        isToday: false,
      };
    } else {
      return {
        text: `D-${diffDays} (${product.nextUseDate.substring(5)})`,
        color: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium',
        isToday: false,
      };
    }
  };

  const nextUseBadge = getNextUseBadge();

  return (
    <div
      className={`group relative rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between ${
        isNightOnly
          ? 'bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-indigo-950/25 border-indigo-200/80 dark:border-indigo-800/60 shadow-md hover:shadow-lg'
          : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-700/60 shadow-sm hover:shadow-md'
      }`}
    >
      <div>
        {/* Header Badges & Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Step badge */}
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold ${stepInfo.color}`}
            >
              <span>{stepInfo.emoji}</span>
              <span>{stepInfo.label}</span>
            </span>

            {/* Night Only Highlight Badge */}
            {isNightOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300/60 dark:border-indigo-700/60 shadow-xs">
                <Moon className="w-3.5 h-3.5 fill-indigo-400" />
                <span>🌙 밤 전용</span>
              </span>
            )}
          </div>

          {/* Edit / Delete Buttons */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => onEdit(product)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
              title="수정"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(product.id, product.name)}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/50 transition-all cursor-pointer"
              title="삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight leading-snug">
          {product.name}
        </h3>

        {/* Ingredient Tags */}
        {product.ingredientTags && product.ingredientTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {product.ingredientTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                <Sparkles className="w-3 h-3 text-emerald-500" />
                <span>{INGREDIENT_LABEL_MAP[tag] || tag}</span>
              </span>
            ))}
          </div>
        )}

        {/* Night Only Warning Alert */}
        {isNightOnly && (
          <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <span>
              <strong>낮시간 사용 주의</strong>: 자외선 민감 성분이 포함되어 있어 밤 루틴에만 권장됩니다.
            </span>
          </div>
        )}
      </div>

      {/* Bottom Info: Cycle & Next Use */}
      <div className="mt-4 pt-3.5 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span className="font-medium">{getCycleText()}</span>
        </div>

        {nextUseBadge && (
          <span className={`px-2.5 py-1 rounded-lg text-[11px] ${nextUseBadge.color}`}>
            {nextUseBadge.text}
          </span>
        )}
      </div>

      {/* Mark Used Today Quick Button */}
      {onMarkUsedToday && (
        <button
          type="button"
          onClick={() => onMarkUsedToday(product)}
          className="mt-3 w-full py-2 px-3 rounded-xl bg-zinc-50 hover:bg-emerald-50 dark:bg-zinc-800/70 dark:hover:bg-emerald-950/40 text-zinc-700 hover:text-emerald-700 dark:text-zinc-300 dark:hover:text-emerald-300 border border-zinc-200/80 hover:border-emerald-300 dark:border-zinc-700 dark:hover:border-emerald-700/60 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>오늘 사용 완료 기록</span>
        </button>
      )}
    </div>
  );
};
