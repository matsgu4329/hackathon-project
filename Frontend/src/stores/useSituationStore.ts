import { create } from 'zustand';

export interface SituationState {
  // --- 모의 시뮬레이션 상태 ---
  currentLocationState: 'OUTDOOR' | 'HOME'; // 외출 중 / 귀가 완료
  mockUvIndex: number;                       // 모의 자외선 지수 (0~11+)
  mockWeather: 'CLEAR' | 'RAIN' | 'DRY';      // 모의 날씨
  homecomingToastActive: boolean;            // 귀가 알림 토스트 활성 여부
  lastHomecomingTime: string | null;         // 귀가 이벤트 발생 시각 (HH:mm)

  // --- 시뮬레이션 제어 함수 ---
  triggerReturnHome: () => void;             // 귀가 이벤트 즉시 발생 (알림 팝업 획득)
  dismissHomecomingToast: () => void;        // 귀가 토스트 닫기
  setMockUvIndex: (uv: number) => void;      // UV 지수 변경 (대시보드 추천 UI 동적 변경)
  setMockWeather: (weather: 'CLEAR' | 'RAIN' | 'DRY') => void; // 날씨 변경
  setCurrentLocationState: (state: 'OUTDOOR' | 'HOME') => void;
  resetSimulation: () => void;               // 초기화
}

const DEFAULT_STATE = {
  currentLocationState: 'OUTDOOR' as const,
  mockUvIndex: 7,
  mockWeather: 'CLEAR' as const,
  homecomingToastActive: false,
  lastHomecomingTime: null,
};

export const useSituationStore = create<SituationState>((set) => ({
  ...DEFAULT_STATE,

  triggerReturnHome: () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    set({
      currentLocationState: 'HOME',
      homecomingToastActive: true,
      lastHomecomingTime: timeStr,
    });
  },

  dismissHomecomingToast: () => {
    set({ homecomingToastActive: false });
  },

  setMockUvIndex: (uv: number) => {
    set({ mockUvIndex: Math.max(0, Math.min(15, uv)) });
  },

  setMockWeather: (weather: 'CLEAR' | 'RAIN' | 'DRY') => {
    set({ mockWeather: weather });
  },

  setCurrentLocationState: (state: 'OUTDOOR' | 'HOME') => {
    set({ currentLocationState: state });
  },

  resetSimulation: () => {
    set({ ...DEFAULT_STATE });
  },
}));
