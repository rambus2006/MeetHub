import apiClient from './axiosInstance';

import type { ApiResponse } from '../types/api';
import type {
  SignUpRequest,
  SignInRequest,
  SignInResponse,
  ReissuanceTokenResponse,
  UserProfile
} from '../types/auth';

// 회원가입 API
export const signUp = async (
  signUpData: SignUpRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(
    '/auth/signup',
    signUpData
  );
  return response.data;
};

// 로그인 API
export const signIn = async (
  signInData: SignInRequest
): Promise<ApiResponse<SignInResponse>> => {
  const response = await apiClient.post<ApiResponse<SignInResponse>>(
    '/auth/signin',
    signInData
  );
  return response.data;
};

// 사용자 프로필 조회 API
export const getUserProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get<ApiResponse<UserProfile>>('/me');
  return response.data.content; 
};

// 프로필 수정 API
export const profileEdit = async (name: string): Promise<ApiResponse<null>> => {
  const response = await apiClient.patch<ApiResponse<null>>('/me', { name });
  return response.data;
};

// 탈퇴 API
export const withdraw = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>('/me');
  return response.data;
};

// 로그아웃 API
export const signOut = async (): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>('/auth/signout');
  return response.data;
};

// 이메일 중복 확인 API
export const checkEmailDuplicate = async (
  email: string
): Promise<ApiResponse<boolean>> => {
  const response = await apiClient.post<ApiResponse<boolean>>(
    '/auth/check-email',
    { email }
  );
  return response.data;
};

// 토큰 재발급 API
export const refreshAccessToken = async (): Promise<ApiResponse<ReissuanceTokenResponse>> => {
  const response = await apiClient.post<ApiResponse<ReissuanceTokenResponse>>('/auth/refresh');
  return response.data;
};

// 비밀번호 변경 API
export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>('/auth/password', {
    current_password: currentPassword,
    new_password: newPassword
  });
  return response.data;
};

