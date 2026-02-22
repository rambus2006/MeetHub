import apiClient from './axiosInstance';
import type {
  ShareContent,
  ReportDetailContent,
  ReportSummary,
  CommentListContent,
  ScriptPageContent,
  PermissionsResponse,
} from '../types/report';
import type { ApiResponse } from '../types/api';

/**
 * 리포트 상세 정보 조회 API
 * @param reportId - 조회할 리포트의 ID
 */
export const getReportDetail = async (
  reportId: string
): Promise<ApiResponse<ReportDetailContent>> => {
  const url = `/reports/${reportId}`;

  const response = await apiClient.get<ApiResponse<ReportDetailContent>>(url);

  return response.data;
};

/**
 * 리포트 상세 정보 수정 API
 * @param reportId - 조회할 리포트의 ID
 */
export const editReportDetail = async (
  reportId: string,
  updatedSummary: ReportSummary
): Promise<ApiResponse<ReportSummary>> => {
  const url = `/reports/${reportId}`;
  const requestBody = {
    summary: updatedSummary,
  };

  const response = await apiClient.put<ApiResponse<ReportSummary>>(
    url,
    requestBody
  );

  return response.data;
};

/**
 * 리포트 삭제 API
 * @param reportId - 조회할 리포트의 ID
 */
export const deleteReport = async (
  reportId: string
): Promise<ApiResponse<null>> => {
  const url = `/reports/${reportId}`;

  const response = await apiClient.delete<ApiResponse<null>>(url);

  return response.data;
};

/**
 * 리포트 공유 링크 생성 API
 * @param reportId - 공유할 리포트의 ID
 */
export const shareReport = async (
  reportId: string
): Promise<ApiResponse<ShareContent | null>> => {
  const url = `/reports/${reportId}/share`;

  const response = await apiClient.post<ApiResponse<ShareContent | null>>(
    url,
    {}
  );

  return response.data;
};

/**
 * 스크립트 전체 조회 API (페이징 적용)
 * @param reportId - 조회할 리포트의 ID
 * @param page - 요청할 페이지 번호 (기본값: 1)
 * @param size - 페이지당 항목 수 (기본값: 10)
 */
export const getScriptList = async (
  reportId: string,
  page: number = 1,
  size: number = 10
): Promise<ApiResponse<ScriptPageContent>> => {
  const url = `/reports/${reportId}/scripts`;

  const response = await apiClient.get<ApiResponse<ScriptPageContent>>(url, {
    params: {
      page: page,
      size: size,
    },
  });

  return response.data;
};

/**
 * 특정 스크립트의 댓글 목록 조회 API
 * @param reportId - 리포트 ID
 * @param scriptId - 스크립트 ID
 */
export const getScriptComments = async (
  reportId: string,
  scriptId: string
): Promise<ApiResponse<CommentListContent>> => {
  const url = `/reports/${reportId}/scripts/${scriptId}/comments`;

  const response = await apiClient.get<ApiResponse<CommentListContent>>(url);

  return response.data;
};

/**
 * 댓글 생성 API
 * @param reportId - 리포트 ID
 * @param scriptId - 스크립트 ID
 * @param content - 댓글 내용
 */
export const createComment = async (
  reportId: string,
  scriptId: string,
  content: string
): Promise<ApiResponse<null>> => {
  const url = `/reports/${reportId}/scripts/${scriptId}/comments`;
  const response = await apiClient.post<ApiResponse<null>>(url, { content });

  return response.data;
};

/**
 * 회의록 공유 API
 * @param id - 리포트 ID
 * @param email - 이메일
 * @param permission - 권한 종류
 */
export const grantPermission = async (
  id: number,
  email: string,
  permission: string
): Promise<ApiResponse<null>> => {
  const url = `/reports/${id}/shares`;
  const response = await apiClient.post<ApiResponse<null>>(url, {
    email,
    permission,
  });

  return response.data;
};

/**
 * 회의록 공유 권한 조회 API
 * @param id - 리포트 ID
 */
export const viewPermission = async (
  id: number
): Promise<ApiResponse<PermissionsResponse>> => {
  const url = `/reports/${id}/shares`;
  const response = await apiClient.get<ApiResponse<PermissionsResponse>>(url);

  return response.data;
};
