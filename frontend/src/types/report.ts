// 리포트 요약 타입
export interface ReportSummary {
  keyword: string[];
  content: string;
}

// 리포트 상세 데이터 전체 타입
export interface ReportDetailContent {
  id: number;
  name: string;
  duration: number;
  videoUrl: string;
  summary: ReportSummary;
  createdAt: string;
}

// 리포트 링크 타입
export interface ShareContent {
  shareUrl: string;
}

// 단일 댓글 타입
export interface CommentDetail {
  id: number;
  userId: number;
  userName: string;
  isSolved: boolean;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// 댓글 조회 API 응답 타입
export interface CommentListContent {
  comments: CommentDetail[];
}

// 개별 스크립트 상세 정보 타입
export interface ScriptItemDetail {
  id: number;
  speaker: string;
  content: string;
  startTime: number;
  endTime: number;
  hasComments: boolean;
}

//페이징 정보 타입
export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// 스크립트 조회 API 응답 타입
export interface ScriptPageContent extends PaginationInfo {
  content: ScriptItemDetail[];
}

// 권한 조회 API 응답 타입
export interface PermissionsResponse {
  id: number;
  userId: number;
  userName: string;
  permission: string;
}
