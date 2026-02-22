import { useNavigate } from 'react-router-dom';
import { signOut as signOutAPI } from '../../api/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../common/useToast';

// 훅 반환 타입
interface UseSignOutReturn {
  handleSignOut: () => Promise<void>;
}

export const useSignOut = (): UseSignOutReturn => {
  const navigate = useNavigate();
  const { signOut } = useAuthStore();
  const { showSuccess, showError } = useToast();

  const handleSignOut = async (): Promise<void> => {
    try {
      const response = await signOutAPI();
      if (response.success) {
        signOut();
        showSuccess('로그아웃되었습니다.');
        navigate('/signin');
      } else {
        showError(
          response.message ||
            '로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.'
        );
      }
    } catch (err) {
      const msg = (err as any)?.response?.data?.message;
      showError(msg || '로그아웃 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return {
    handleSignOut,
  };
};
