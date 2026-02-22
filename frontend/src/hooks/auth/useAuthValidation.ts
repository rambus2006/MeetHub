// auth 관련 입력 검증 함수들

// 이메일 검증
export const validateEmail = (email: string): string => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return '';
  if (!emailRegex.test(email)) return '올바른 이메일 형식을 입력해주세요';
  return '';
};

// 비밀번호 검증
export const validatePassword = (password: string): string => {
  if (!password) return '';
  // 허용된 문자만 사용되었는지 검사
  if (!/^[A-Za-z\d!@#$%&*?]+$/.test(password)) {
    return '허용되지 않는 특수문자입니다';
  }

  if (password.length < 8) return '비밀번호는 8자 이상이어야 합니다';

  // 구성 요건: 문자, 숫자, 허용 특수문자 각 1자 이상 포함
  const hasLetter = /[A-Za-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasAllowedSpecial = /[!@#$%&*?]/.test(password);
  if (!(hasLetter && hasDigit && hasAllowedSpecial)) {
    return '비밀번호는 문자, 숫자, 특수문자를 포함해야 합니다';
  }
  return '';
};

// 비밀번호 확인 검증
export const validateConfirmPassword = (
  confirmPassword: string,
  password: string
): string => {
  if (!confirmPassword) return '';
  if (confirmPassword !== password) return '비밀번호가 일치하지 않습니다';
  return '';
};
