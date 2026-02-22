import type { Toast } from '../../store/useToastStore';
import { useToastStore } from '../../store/useToastStore';

export const useToast = () => {
  const { addToast } = useToastStore();

  // 스토어에 토스트 추가 (id를 제외한 속성 추가)
  const showToast = (toast: Omit<Toast, 'id'>) => {
    addToast(toast);
  };

  // 성공 토스트
  const showSuccess = (message: string, duration?: number) => {
    showToast({ type: 'success', message, duration });
  };

  // 에러 토스트
  const showError = (message: string, duration?: number) => {
    showToast({ type: 'error', message, duration });
  };

  // 경고 토스트
  const showWarning = (message: string, duration?: number) => {
    showToast({ type: 'warning', message, duration });
  };

  // 정보 토스트
  const showInfo = (message: string, duration?: number) => {
    showToast({ type: 'info', message, duration });
  };

  // 액션이 있는 토스트
  const showToastWithAction = (
    type: Toast['type'],
    message: string,
    actionLabel: string,
    actionOnClick: () => void,
    duration?: number
  ) => {
    showToast({
      type,
      message,
      duration,
      action: {
        label: actionLabel,
        onClick: actionOnClick,
      },
    });
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToastWithAction,
  };
};
