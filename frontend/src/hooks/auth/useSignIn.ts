import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn as signInAPI } from '../../api/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { validateEmail } from './useAuthValidation';
import { useToast } from '../common/useToast';
import type { SignInFormData, SignInErrors } from '../../types/auth';
import { fetchUserProfile } from './useProfile';

// 훅 반환 타입
interface UseSignInReturn {
  formData: SignInFormData;
  errors: SignInErrors;
  isLoading: boolean;
  apiError: string;
  handleInputChange: (field: string, value: string) => void;
  handleSignIn: () => Promise<void>;
  isFormValid: () => boolean;
  resetForm: () => void;
}

export const useSignIn = (): UseSignInReturn => {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const { showSuccess, showError } = useToast();
  const [apiError, setApiError] = useState('');

  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<SignInErrors>({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // 입력값 변경
  const handleInputChange = (field: string, value: string): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 실시간 검증
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (field === 'password') {
      setErrors((prev) => ({ ...prev, password: '' }));
    }
  };

  // 폼이 유효한지 확인하는 함수
  const isFormValid = (): boolean => {
    return (
      Boolean(formData.email) &&
      Boolean(formData.password) &&
      !errors.email &&
      !errors.password
    );
  };

  // 로그인 API 호출 함수
  const callSignInAPI = async (data: { email: string; password: string }) => {
    return await signInAPI(data);
  };

  // 로그인 처리 함수
  const handleSignIn = async (): Promise<void> => {
    if (!isFormValid() || isLoading) return;

    setIsLoading(true);
    setApiError('');

    try {
      const signInData = {
        email: formData.email,
        password: formData.password,
      };

      const response = await callSignInAPI(signInData);
      if (response.success) {
        const content = (response as any)?.content;
        const token = content?.accessToken ?? null;
        const userId = content?.userId ?? null;
        signIn(token ?? null, userId ?? null);
        // 로그인 후 사용자 정보 가져와 로컬 스토리지에 저장하는 함수
        await fetchUserProfile();
        showSuccess('로그인이 완료되었습니다.');

        navigate('/');
      }
    } catch (err) {
      const msg = (err as any)?.response?.data?.message;
      showError(msg || '로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
      resetForm();
      setIsLoading(false);
    }
  };

  // 폼 초기화
  const resetForm = (): void => {
    setFormData({
      email: '',
      password: '',
    });
    setErrors({
      email: '',
      password: '',
    });
  };

  return {
    formData,
    errors,
    isLoading,
    apiError,
    handleInputChange,
    handleSignIn,
    isFormValid,
    resetForm,
  };
};
