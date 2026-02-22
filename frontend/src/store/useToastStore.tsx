import { create } from 'zustand';

export interface Toast {
  id: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastState {
  // 화면에 표시되어야 할 토스트의 목록
  toasts: Toast[];
  // 새 토스트 추가
  addToast: (toast: Omit<Toast, 'id'>) => void;
  // 토스트 제거
  removeToast: (id: string) => void;
  // 모든 토스트 제거
  clearAll: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],

  // 토스트 추가
  addToast: (toast) => {
    // 랜덤으로 id 생성
    const id = Math.random().toString(36).substr(2, 9);
    // 새로운 토스트 추가(기본 duration 5초)
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 2000,
    };

    // 배열에 새로운 토스트 추가
    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    // 자동 제거 (지속기간이 0이라면 자동으로 제거되지 않음)
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        const currentToasts = get().toasts;
        if (currentToasts.some((t) => t.id === id)) {
          set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
          }));
        }
      }, newToast.duration);
    }
  },

  // 특정 토스트 제거
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  // 모든 토스트 제거
  clearAll: () => {
    set({ toasts: [] });
  },
}));
