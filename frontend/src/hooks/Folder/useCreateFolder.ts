import { useState } from 'react';
import { createFolder, getFolders } from '../../api/FileService';
import type { CreateFolderRequest, Folder } from '../../types/Folder';
import type { ApiResponse } from '../../types/api';
import { useToast } from '../common/useToast';

// 폴더 생성 함수
export const useFolderMake = (onFolderCreated?: () => void | Promise<void>) => {
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 모달 열림 상태
  
  // 토스트 창
  const { showSuccess, showError, showWarning } = useToast();

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showWarning('폴더 이름을 입력해주세요.');
      return;
    }

    // 루트 폴더 찾기 (parentId가 null인 폴더)
    let rootFolderId: number | null = null;
    try {
      const response: ApiResponse<Folder[]> = await getFolders();
      if (response.success && response.content) {
        const rootFolder = response.content.find((folder) => folder.parentId === null);
        if (rootFolder) {
          rootFolderId = rootFolder.id;
        }
      }
    } catch (error) {
      console.error('폴더 목록 조회 실패:', error);
    }

    // 루트 폴더가 없으면 생성 필요하지만, 일단 루트 폴더를 parentId로 설정
    const folderData: CreateFolderRequest = {
      parentId: rootFolderId,
      name: newFolderName.trim(),
    };

    try {
      setIsCreating(true);
      await createFolder(folderData);
      showSuccess('폴더가 생성되었습니다!');
      setNewFolderName('');
      setIsModalOpen(false); // 모달 닫기
      // 폴더 생성 후 콜백 실행 (폴더 목록 다시 로드 등)
      if (onFolderCreated) {
        await onFolderCreated();
      }
    } catch (error) {
      console.error('폴더 생성 실패:', error);
      showError('폴더 생성에 실패했습니다.');
    } finally {
      setIsCreating(false);
    }
  };

  // 모달 열기
  const openCreateModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeCreateModal = () => {
    setIsModalOpen(false);
    setNewFolderName('');
  };

  return {
    newFolderName,
    isCreating,
    isModalOpen,
    handleCreateFolder,
    setNewFolderName,
    openCreateModal,
    closeCreateModal,
  };
};

