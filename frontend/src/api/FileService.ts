import apiClient from './axiosInstance';
import type { ApiResponse } from '../types/api';
import type {
  CreateFolderRequest,
  Folder,
  Report,
  UpdateFolderRequest,
  UpdateFileRequest,
} from '../types/Folder';
import type { RelocateItems } from '../types/Folder';
// 폴더 생성 API
export const createFolder = async (
  data: CreateFolderRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(
    '/me/filesystem/folder',
    data
  );
  return response.data;
};

// 폴더 목록 조회 API
export const getFolders = async (): Promise<ApiResponse<Folder[]>> => {
  const response = await apiClient.get<ApiResponse<Folder[]>>(
    '/me/filesystem/folder/all'
  );
  return response.data;
};

// 특정 폴더의 파일 목록 조회 API
export const getFiles = async (
  folderId: number
): Promise<ApiResponse<Report[]>> => {
  const response = await apiClient.get<ApiResponse<Report[]>>(
    `/me/filesystem/folder/${folderId}/all`
  );
  return response.data;
};

export const relocateItems = async (
  data: RelocateItems
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post<ApiResponse<null>>(
    '/me/filesystem/move',
    data
  );
  return response.data;
};

// 폴더 삭제 API
export const deleteFolder = async (
  folderId: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.delete<ApiResponse<null>>(
    `/me/filesystem/folder/${folderId}`
  );
  return response.data;
};

// 폴더 이름 수정 API
export const updateFolder = async (
  folderId: number,
  data: UpdateFolderRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.patch<ApiResponse<null>>(
    `/me/filesystem/folder/${folderId}`,
    data
  );
  return response.data;
};

// 파일 이름 수정 API
export const updateFile = async (
  fileId: number,
  data: UpdateFileRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.patch<ApiResponse<null>>(
    `/me/filesystem/file/${fileId}`,
    data
  );
  return response.data;
};