import { useState } from 'react';
import { deleteFolder } from '../../api/FileService';
import { useToast } from '../common/useToast';

// 폴더 삭제 훅
export const useDeleteFolder = (
  onDeleteCompleted?: () => void | Promise<void>
) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(
    null
  );

  const { showSuccess, showError } = useToast();

  // 폴더 삭제 핸들러 함수
  const handleDeleteFolder = async (folderId: number) => {
    try {
      setIsDeleting(true);

      const response = await deleteFolder(folderId);

      if (response.success) {
        showSuccess('폴더가 삭제되었습니다!');
        if (onDeleteCompleted) {
          await onDeleteCompleted();
        }
      } else {
        showError(response.message || '폴더 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('폴더 삭제 실패:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        '폴더 삭제에 실패했습니다.';

      showError(errorMessage);
    } finally {
      setIsDeleting(false);
      setSelectedFolderId(null);
    }
  };

  // 삭제 확인 모달 열기
  const openDeleteModal = (folderId: number) => {
    setSelectedFolderId(folderId);
  };

  // 삭제 모달 닫기
  const closeDeleteModal = () => {
    setSelectedFolderId(null);
  };

  return {
    isDeleting,
    selectedFolderId,
    handleDeleteFolder,
    openDeleteModal,
    closeDeleteModal,
  };
};

