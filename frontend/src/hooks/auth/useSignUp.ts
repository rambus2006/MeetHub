import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { signUp, checkEmailDuplicate } from '../../api/authService';
import { signIn as signInAPI } from '../../api/authService';

import type { SignUpFormData, SignUpErrors } from '../../types/auth';

import { useToast } from '../common/useToast';

import { useAuthStore } from '../../store/useAuthStore';
import { fetchUserProfile } from './useProfile';

import {
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from './useAuthValidation';

interface UseSignUpReturn {
  handleSignUp: () => Promise<void>;
  handleInputChange: (field: string, value: string) => void;
  formData: SignUpFormData;
  errors: SignUpErrors;
  emailCheckState: boolean;
  handleEmailDuplicateCheck: () => void;
  isFormValid: () => boolean;
  resetForm: () => void;
  emailCheckDone: boolean;
}

export const useSignUp = (): UseSignUpReturn => {
  const navigate = useNavigate();
  const { signIn } = useAuthStore();
  const { showSuccess, showError } = useToast();

  // 이메일 중복 여부 체크 상태
  const [emailCheckState, setEmailCheckState] = useState(false);
  const [emailCheckDone, setEmailCheckDone] = useState(false);

  // 입력값 관련 상태
  const [formData, setFormData] = useState<SignUpFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });

  // 에러 관련 상태
  const [errors, setErrors] = useState<SignUpErrors>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  // 폼 초기화
  const resetForm = (): void => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
    });
    setErrors({
      email: '',
      password: '',
      confirmPassword: '',
    });
    setEmailCheckState(false);
    setEmailCheckDone(false);
  };

  // 회원가입 API 호출 함수
  const signUpAPI = async (data: {
    email: string;
    password: string;
    name: string;
  }) => {
    return await signUp(data);
  };

  // 회원가입 요청 API 호출
  const handleSignUp = async (): Promise<void> => {
    try {
      const signUpData = {
        email: formData.email,
        password: formData.password,
        name: formData.name,
      };

      const response = await signUpAPI(signUpData);

      if (response.success) {
        try {
          const signInResponse = await signInAPI({
            email: formData.email,
            password: formData.password,
          });

          if (signInResponse.success) {
            const content = (signInResponse as any)?.content;
            const token = content?.accessToken ?? null;
            const userId = content?.userId ?? null;
            signIn(token ?? null, userId ?? null);
            // 로그인 후 사용자 정보 가져와 로컬 스토리지에 저장하는 함수
            await fetchUserProfile();

            showSuccess('회원가입이 완료되었습니다.');

            navigate('/');
          } else {
            showSuccess('회원가입이 완료되었습니다.');
            navigate('/signin');
          }
        } catch {
          showSuccess('회원가입이 완료되었습니다.');
          navigate('/signin');
        }
        // 폼 초기화
        resetForm();
      }
    } catch (err) {
      const msg = (err as any)?.response?.data?.message;
      showError(msg || '회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 입력값 변경
  const handleInputChange = (field: string, value: string): void => {
    // 변경값 반영
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // 이메일 검증
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
      // 이메일이 변경되면 중복확인 상태 초기화
      setEmailCheckState(false);
      setEmailCheckDone(false);
    }
    // 비밀번호 검증
    else if (field === 'password') {
      const newPassword = value;
      setErrors((prev) => ({
        ...prev,
        // 비밀번호 업데이트
        password: validatePassword(newPassword),
        // 비밀번호 변경 시 다시 비밀번호 확인 검사
        confirmPassword: formData.confirmPassword
          ? validateConfirmPassword(formData.confirmPassword, newPassword)
          : '',
      }));
      // 비밀번호 확인
    } else if (field === 'confirmPassword') {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, formData.password),
      }));
    }
  };

  // 이메일 중복 확인 API 호출 함수
  const checkEmailDuplicateAPI = async (email: string) => {
    return await checkEmailDuplicate(email);
  };

  const handleEmailDuplicateCheck = async (): Promise<void> => {
    try {
      const response = await checkEmailDuplicateAPI(formData.email);

      if (response.success) {
        setEmailCheckState(!response.content);
        setEmailCheckDone(true);
      }
    } catch {
      showError('이메일 중복 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  // 폼이 유효한지 확인
  const isFormValid = (): boolean => {
    return (
      Boolean(formData.email) &&
      Boolean(formData.password) &&
      Boolean(formData.confirmPassword) &&
      Boolean(formData.name) &&
      !errors.email &&
      !errors.password &&
      !errors.confirmPassword &&
      emailCheckState
    );
  };

  return {
    errors,
    handleSignUp,
    handleInputChange,
    formData,
    emailCheckState,
    handleEmailDuplicateCheck,
    emailCheckDone,
    isFormValid,
    resetForm,
  };
};
