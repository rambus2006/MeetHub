import axios from 'axios';

import { useAuthStore } from '../store/useAuthStore';
import type { ApiResponse } from '../types/api';
import type { ReissuanceTokenResponse } from '../types/auth';

const VITE_API_BASE_URL = import.meta.env.VITE_SERVER_URL;
const base = VITE_API_BASE_URL || '';
const baseURL = `${base}/api`;

const apiClient = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// refresh 전용 클라이언트
const refreshClient = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// 공통 Authorization 헤더 부착
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 토큰 재발급 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(token: string | null, error: unknown) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (token) {
      resolve(token);
    } else {
      reject(error);
    }
  });
  failedQueue = [];
}

// 토큰 재발급 요청
apiClient.interceptors.response.use(
  // 정상응답
  (response) => response,

  async (error) => {
    const status: number | undefined = error?.response?.status;
    const originalConfig = error?.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;

    if (!originalConfig || typeof status !== 'number') {
      return Promise.reject(error);
    }

    // 재발급 요청 자체는 재시도하지 않음
    const url = (originalConfig.url as string) || '';
    if (url.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (status === 401) {
      // 이미 재시도한 요청은 더 이상 처리하지 않음
      if (originalConfig._retry) {
        return Promise.reject(error);
      }
      originalConfig._retry = true;

      // 재발급 진행 중이면 대기열에 등록하고 토큰 수령 후 재시도
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string | null) => {
              if (token) {
                originalConfig.headers = originalConfig.headers ?? {};
                (originalConfig.headers as any).Authorization =
                  `Bearer ${token}`;
                resolve(apiClient(originalConfig));
              } else {
                reject(error);
              }
            },
            reject,
          });
        });
      }

      // 재발급 시작
      isRefreshing = true;
      try {
        const refreshResponse =
          await refreshClient.post<ApiResponse<ReissuanceTokenResponse>>(
            '/auth/refresh'
          );
        const newToken = refreshResponse?.data?.content?.accessToken ?? null;

        // 스토어에 최신 토큰 저장
        if (newToken) {
          useAuthStore.getState().setAccessToken(newToken);
        }

        // 대기열 처리
        processQueue(newToken, null);

        // 현재 요청 재시도
        if (newToken) {
          originalConfig.headers = originalConfig.headers ?? {};
          (originalConfig.headers as any).Authorization = `Bearer ${newToken}`;
          return apiClient(originalConfig);
        }

        // 토큰이 없다면 실패 처리
        useAuthStore.getState().signOut();
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
        return Promise.reject(error);
      } catch (err) {
        // 재발급 실패: 대기열 모두 실패 처리 후 로그아웃
        processQueue(null, err);
        useAuthStore.getState().signOut();
        if (typeof window !== 'undefined') {
          window.location.href = '/signin';
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
