import React from 'react';
import { Sparkles } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  const progressPercent = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full mb-8">
      {/* Top step info & percentage */}
      <div className="flex items-center justify-between text-xs font-semibold tracking-wide text-zinc-500 dark:text-zinc-400 mb-2.5">
        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>STEP {currentStep} OF {totalSteps}</span>
        </div>
        <span className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[11px] font-mono border border-emerald-200/60 dark:border-emerald-800/40">
          {progressPercent}% 완료
        </span>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800/90 rounded-full overflow-hidden p-0.5 border border-zinc-200/50 dark:border-zinc-700/50">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(16,185,129,0.35)]"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Pills */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {stepLabels.map((label, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={label}
              className={`flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg text-xs font-medium transition-all ${
                isCurrent
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/60 font-semibold'
                  : isCompleted
                  ? 'bg-zinc-100/80 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300'
                  : 'bg-zinc-50 text-zinc-400 dark:bg-zinc-900/40 dark:text-zinc-600'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isCurrent
                    ? 'bg-emerald-600 text-white'
                    : isCompleted
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-500'
                }`}
              >
                {stepNum}
              </span>
              <span className="truncate text-[11px]">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
