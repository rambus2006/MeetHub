// API 응답의 공통 구조
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  content: T;
  errorCode?: string;
}
