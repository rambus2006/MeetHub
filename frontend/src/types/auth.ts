// API 요청 타입
export interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

// 사용자 정보 타입
export interface UserProfile {
  email: string;
  name: string;
}

// API 응답 타입
export interface SignInResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
}

// 토큰 재발급 응답 타입
export interface ReissuanceTokenResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

// 폼 데이터 타입
export interface SignUpFormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface SignInErrors {
  email: string;
  password: string;
}

// 폼 에러 타입
export interface SignUpErrors {
  email: string;
  password: string;
  confirmPassword: string;
}
