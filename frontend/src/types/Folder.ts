// 폴더 생성 요청 타입
export interface CreateFolderRequest {
  parentId: number | null;
  name: string;
}

// 폴더 이름 수정 요청 타입
export interface UpdateFolderRequest {
  name: string;
}

// 파일 이름 수정 요청 타입
export interface UpdateFileRequest {
  name: string;
}

// 폴더 정보 타입 (응답 content에 포함될 수 있음)
export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  createdAt: string;
}

// 파일(회의 리포트) 정보 타입
export interface Report {
  id: number;
  name: string;
  createdAt: string;
}

// 폴더/파일 이동 API
export interface RelocateItems {
  targetId: number; // 이동할 대상 폴더 ID
  folderRelocationInfos: number[]; // 이동할 폴더 ID 목록
  fileRelocationInfos: number[]; // 이동할 파일 ID 목록
}