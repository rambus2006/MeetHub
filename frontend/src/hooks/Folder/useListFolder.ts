import { useState, useEffect } from 'react';
import { getFolders, getFiles } from '../../api/FileService';
import type { Folder, Report } from '../../types/Folder';
import type { ApiResponse } from '../../types/api';

// 폴더 목록 및 파일 목록 로드하는 함수
export const useFolderList = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderFiles, setFolderFiles] = useState<{
    [folderId: number]: Report[];
  }>({});
  const [expandedFolders, setExpandedFolders] = useState<{
    [folderId: number]: boolean;
  }>({});
  const [isLoading, setIsLoading] = useState(true);

  // 폴더 목록 로드
  const loadFolders = async () => {
    try {
      setIsLoading(true);
      const response: ApiResponse<Folder[]> = await getFolders();
      if (response.success && response.content) {
        // 최신순으로 정렬 (createdAt 기준 내림차순)
        const sortedFolders = [...response.content].sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // 내림차순 (최신이 먼저)
        });
        setFolders(sortedFolders);

        // 더미 파일 데이터 생성 제거 - 실제 API에서만 파일을 가져옴
        setFolderFiles({});
      }
    } catch (error) {
      console.error('폴더 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 폴더 토글 및 파일 목록 로드
  const toggleFolder = async (folderId: number) => {
    const isExpanded = expandedFolders[folderId];

    // 폴더를 열 때만 파일 목록 조회
    if (!isExpanded && !folderFiles[folderId]) {
      try {
        const response: ApiResponse<Report[]> = await getFiles(folderId);
        if (response.success && response.content) {
          setFolderFiles((prev) => ({
            ...prev,
            [folderId]: response.content || [],
          }));
        }
      } catch (error) {
        console.error('파일 목록 조회 실패:', error);
        // 에러 발생 시 빈 배열로 설정
        setFolderFiles((prev) => ({
          ...prev,
          [folderId]: [],
        }));
      }
    }

    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };
  //파일 및 폴더 목록 조회 함수 끝

  // 컴포넌트 마운트 시 폴더 목록 자동 로드
  useEffect(() => {
    loadFolders();
  }, []);

  return {
    folders,
    folderFiles,
    expandedFolders,
    isLoading,
    loadFolders,
    toggleFolder,
  };
};
