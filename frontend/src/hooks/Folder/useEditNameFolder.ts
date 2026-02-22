import { useState } from 'react';
import { updateFolder, updateFile } from '../../api/FileService';
import { useToast } from '../common/useToast';

type ItemType = 'folder' | 'file';

// 폴더/파일 이름 수정 훅
export const useEditNameFolder = (
  onUpdateCompleted?: () => void | Promise<void>
) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(
    null
  );
  const [newName, setNewName] = useState('');

  const { showSuccess, showError, showWarning } = useToast();

  // 이름 수정 핸들러 함수
  const handleUpdateName = async () => {
    if (!newName.trim()) {
      showWarning('이름을 입력해주세요.');
      return;
    }

    if (!selectedItemId || !selectedItemType) {
      showError('수정할 항목이 선택되지 않았습니다.');
      return;
    }

    try {
      setIsUpdating(true);

      // 실제 파일이나 폴더는 API 호출
      let response;
      if (selectedItemType === 'folder') {
        response = await updateFolder(selectedItemId, {
          name: newName.trim(),
        });
      } else {
        response = await updateFile(selectedItemId, {
          name: newName.trim(),
        });
      }

      if (response.success) {
        showSuccess(
          selectedItemType === 'folder'
            ? '폴더 이름이 수정되었습니다!'
            : '파일 이름이 수정되었습니다!'
        );
        setNewName('');
        setIsModalOpen(false);
        if (onUpdateCompleted) {
          await onUpdateCompleted();
        }
      } else {
        showError(
          response.message ||
            (selectedItemType === 'folder'
              ? '폴더 이름 수정에 실패했습니다.'
              : '파일 이름 수정에 실패했습니다.')
        );
      }
    } catch (error: any) {
      console.error('이름 수정 실패:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        (selectedItemType === 'folder'
          ? '폴더 이름 수정에 실패했습니다.'
          : '파일 이름 수정에 실패했습니다.');

      showError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // 모달 열기 (폴더)
  const openFolderEditModal = (folderId: number, currentName: string) => {
    setSelectedItemId(folderId);
    setSelectedItemType('folder');
    setNewName(currentName);
    setIsModalOpen(true);
  };

  // 모달 열기 (파일)
  const openFileEditModal = (fileId: number, currentName: string) => {
    setSelectedItemId(fileId);
    setSelectedItemType('file');
    setNewName(currentName);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeEditModal = () => {
    setIsModalOpen(false);
    setSelectedItemId(null);
    setSelectedItemType(null);
    setNewName('');
  };

  return {
    isUpdating,
    isModalOpen,
    selectedItemId,
    selectedItemType,
    newName,
    setNewName,
    handleUpdateName,
    openFolderEditModal,
    openFileEditModal,
    closeEditModal,
  };
};

