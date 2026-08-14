'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SkinType, OutingPatternType, UserProfileRequest } from '../../types/profile';
import { getProfile, saveProfile } from '../../lib/api';
import { ProgressBar } from '../../components/onboarding/ProgressBar';
import { StepSkinType } from '../../components/onboarding/StepSkinType';
import { StepOutingPattern } from '../../components/onboarding/StepOutingPattern';
import { StepBaseRoutine } from '../../components/onboarding/StepBaseRoutine';
import { StepSummary } from '../../components/onboarding/StepSummary';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Clock,
  Info,
} from 'lucide-react';

const STEP_LABELS = ['피부 타입', '외출 패턴', '기초 루틴', '완료'];

export default function OnboardingPage() {
  const router = useRouter();

  // Wizard Step (1: Skin Type, 2: Outing, 3: Routine, 4: Summary/Done)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [skinType, setSkinType] = useState<SkinType | null>(null);
  const [outingPatternType, setOutingPatternType] = useState<OutingPatternType>('REGULAR');
  const [outingStartTime, setOutingStartTime] = useState<string>('09:00');
  const [outingEndTime, setOutingEndTime] = useState<string>('18:00');
  const [preferredNotificationTime, setPreferredNotificationTime] = useState<string>('08:00');
  const [baseRoutineItems, setBaseRoutineItems] = useState<string[]>([
    '클렌징폼',
    '수분크림',
    '자외선차단제',
  ]);

  // UI Status
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Load existing profile on mount if present
  useEffect(() => {
    async function loadInitialData() {
      try {
        const profile = await getProfile();
        if (profile) {
          if (profile.skinType) setSkinType(profile.skinType);
          if (profile.outingPatternType) setOutingPatternType(profile.outingPatternType);
          if (profile.outingStartTime) setOutingStartTime(profile.outingStartTime.substring(0, 5));
          if (profile.outingEndTime) setOutingEndTime(profile.outingEndTime.substring(0, 5));
          if (profile.preferredNotificationTime) {
            setPreferredNotificationTime(profile.preferredNotificationTime.substring(0, 5));
          }
          if (profile.baseRoutineItems && profile.baseRoutineItems.length > 0) {
            setBaseRoutineItems(profile.baseRoutineItems);
          }
        }
      } catch (err) {
        console.warn('Could not load existing profile:', err);
      } finally {
        setInitialLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleNext = () => {
    setErrorMessage(null);

    // Validate step 1
    if (currentStep === 1 && !skinType) {
      setErrorMessage('피부 타입을 하나 선택해 주세요.');
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async () => {
    if (!skinType) {
      setErrorMessage('피부 타입을 먼저 선택해 주세요.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const payload: UserProfileRequest = {
      skinType,
      outingPatternType,
      outingStartTime: outingPatternType === 'REGULAR' ? outingStartTime : null,
      outingEndTime: outingPatternType === 'REGULAR' ? outingEndTime : null,
      preferredNotificationTime,
      baseRoutineItems,
    };

    try {
      await saveProfile(payload);
      setIsSuccess(true);

      // Smooth transition to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1200);
    } catch (err) {
      console.error('Failed to submit onboarding profile:', err);
      setErrorMessage(
        err instanceof Error ? err.message : '프로필 저장 중 오류가 발생했습니다.'
      );
      setIsSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
        <div className="flex flex-col items-center gap-3 p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl text-center">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 animate-pulse">
            <Clock className="w-8 h-8 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">SkinClock 준비 중...</h2>
          <p className="text-xs text-zinc-500">잠시만 기다려주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 via-emerald-50/20 to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-black text-zinc-900 dark:text-zinc-100 flex flex-col justify-between">
      {/* Top Brand Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/80 dark:border-zinc-800 px-4 py-3.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-300 bg-clip-text text-transparent">
                SkinClock
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                피부 시계 맞춤 설정
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40">
              <Sparkles className="w-3 h-3" />
              <span>온보딩 위저드</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Form Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 md:py-8 flex flex-col">
        <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800 shadow-xl flex-1 flex flex-col justify-between">
          <div>
            {/* Progress Bar */}
            <ProgressBar
              currentStep={currentStep}
              totalSteps={4}
              stepLabels={STEP_LABELS}
            />

            {/* Error Banner if any */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/60 text-rose-800 dark:text-rose-300 text-xs font-medium flex items-center gap-2.5 animate-shake">
                <Info className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step Wizard Content */}
            {currentStep === 1 && (
              <StepSkinType
                value={skinType}
                onChange={(type) => {
                  setSkinType(type);
                  setErrorMessage(null);
                }}
              />
            )}

            {currentStep === 2 && (
              <StepOutingPattern
                patternType={outingPatternType}
                outingStartTime={outingStartTime}
                outingEndTime={outingEndTime}
                preferredNotificationTime={preferredNotificationTime}
                onChangePattern={setOutingPatternType}
                onChangeStartTime={setOutingStartTime}
                onChangeEndTime={setOutingEndTime}
                onChangeNotificationTime={setPreferredNotificationTime}
              />
            )}

            {currentStep === 3 && (
              <StepBaseRoutine
                selectedItems={baseRoutineItems}
                onChangeItems={setBaseRoutineItems}
              />
            )}

            {currentStep === 4 && (
              <StepSummary
                skinType={skinType || 'UNKNOWN'}
                outingPatternType={outingPatternType}
                outingStartTime={outingStartTime}
                outingEndTime={outingEndTime}
                preferredNotificationTime={preferredNotificationTime}
                baseRoutineItems={baseRoutineItems}
              />
            )}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isSubmitting || isSuccess}
                className="h-12 px-5 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white hover:bg-zinc-50 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-200 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>이전</span>
              </button>
            ) : (
              <div />
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="h-12 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-bold text-sm flex items-center gap-2 shadow-lg shadow-zinc-900/10 dark:shadow-none transition-all cursor-pointer"
              >
                <span>다음 단계</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || isSuccess}
                className="h-12 px-7 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>저장 및 맞춤 플랜 생성 중...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>완료! 대시보드로 이동합니다</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>설정 완료하고 추천 루틴 받기</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer Disclaimer (FE PRD Section 6.3) */}
      <footer className="max-w-2xl mx-auto w-full px-4 py-4 text-center">
        <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-relaxed">
          ⚠️ SkinClock의 안내는 일반적인 생활 습관 관리 참고용이며, 의학적 진단이나 처방을 대신하지 않습니다. 피부 이상 발생 시 전문의와 상담하세요.
        </p>
      </footer>
    </div>
  );
}
