import { useState } from 'react';
import { relocateItems } from '../../api/FileService';
import type { RelocateItems, Folder } from '../../types/Folder';
import { useToast } from '../common/useToast';

// 폴더/파일 이동 훅
export const useFolderMove = (
  onMoveCompleted?: () => void | Promise<void>,
  folders: Folder[] = []
) => {
  const [isMoving, setIsMoving] = useState(false); // 이동 진행 중 여부
  const [targetFolderId, setTargetFolderId] = useState<number | null>(null); // 이동할 대상 폴더 ID
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null); // 이동할 폴더 ID
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null); // 이동할 파일 ID

  // 드래그앤드롭 상태 관리
  const [draggedFolderId, setDraggedFolderId] = useState<number | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<number | null>(null);
  const [rootDragOver, setRootDragOver] = useState(false);
  const [rootDragOverMiddle, setRootDragOverMiddle] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [maxDepthWarning, setMaxDepthWarning] = useState<number | null>(null);

  // 토스트 창
  const { showSuccess, showError, showWarning } = useToast();

  // 최상위 폴더 찾기
  const rootFolder = folders.find((folder) => folder.parentId === null);

  // 폴더가 2단계인지 확인하는 함수
  const isSecondLevelFolder = (folder: Folder): boolean => {
    if (!rootFolder) return false;
    return folder.parentId === rootFolder.id;
  };

  // 폴더의 레벨(단계)을 계산하는 함수 (1단계 = rootFolder)
  const getFolderLevel = (folder: Folder): number => {
    if (!rootFolder) return 0;
    if (folder.parentId === null) return 1; // rootFolder는 1단계
    if (folder.parentId === rootFolder.id) return 2; // 2단계

    // 재귀적으로 부모 폴더를 찾아 레벨 계산
    const parent = folders.find((f) => f.id === folder.parentId);
    if (!parent) return 0;

    const parentLevel = getFolderLevel(parent);
    return parentLevel + 1;
  };

  // 직접 부모인지 확인하는 함수
  const isDirectParent = (
    draggedFolderId: number,
    targetFolderId: number
  ): boolean => {
    const draggedFolder = folders.find((f) => f.id === draggedFolderId);
    return draggedFolder?.parentId === targetFolderId;
  };

  // 폴더 이동 핸들러 함수
  const handleMoveFolder = async (folderId: number, targetId: number) => {
    try {
      setIsMoving(true);

      const relocateData: RelocateItems = {
        targetId: targetId,
        folderRelocationInfos: [folderId],
        fileRelocationInfos: [],
      };

      const response = await relocateItems(relocateData);

      if (response.success) {
        showSuccess('폴더가 이동되었습니다!');
        // 폴더 이동 후 콜백 실행 (폴더 목록 다시 로드 등)
        if (onMoveCompleted) {
          await onMoveCompleted();
        }
      } else {
        showError(response.message || '폴더 이동에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('폴더 이동 실패:', error);

      // 에러 응답에서 메시지 추출
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        '폴더 이동에 실패했습니다.';

      showError(errorMessage);
    } finally {
      setIsMoving(false);
      setTargetFolderId(null);
      setSelectedFolderId(null);
      setSelectedFileId(null);
    }
  };

  // 파일 이동 핸들러 함수
  const handleMoveFile = async (fileId: number, targetId: number) => {
    try {
      setIsMoving(true);

      // 실제 파일은 API 호출
      const relocateData: RelocateItems = {
        targetId: targetId,
        folderRelocationInfos: [],
        fileRelocationInfos: [fileId],
      };

      const response = await relocateItems(relocateData);

      if (response.success) {
        showSuccess('파일이 이동되었습니다!');
        // 파일 이동 후 콜백 실행 (폴더 목록 다시 로드 등)
        if (onMoveCompleted) {
          await onMoveCompleted();
        }
      } else {
        showError(response.message || '파일 이동에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('파일 이동 실패:', error);

      // 에러 응답에서 메시지 추출
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        '파일 이동에 실패했습니다.';

      showError(errorMessage);
    } finally {
      setIsMoving(false);
      setTargetFolderId(null);
      setSelectedFolderId(null);
      setSelectedFileId(null);
    }
  };

  // 폴더 이동 모달 열기
  const openMoveModal = (folderId: number) => {
    setSelectedFolderId(folderId);
    setSelectedFileId(null);
    setTargetFolderId(null);
  };

  // 파일 이동 모달 열기
  const openFileMoveModal = (fileId: number) => {
    setSelectedFileId(fileId);
    setSelectedFolderId(null);
    setTargetFolderId(null);
  };

  // 이동 모달 닫기
  const closeMoveModal = () => {
    setSelectedFolderId(null);
    setSelectedFileId(null);
    setTargetFolderId(null);
  };

  // 드래그 시작 핸들러
  const handleDragStart = (e: React.DragEvent, folderId: number) => {
    setDraggedFolderId(folderId);
    setIsEditMode(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', folderId.toString());
    e.dataTransfer.setData('application/folder', folderId.toString());
  };

  // 드래그 종료 핸들러
  const handleDragEnd = () => {
    setDraggedFolderId(null);
    setDragOverFolderId(null);
    setRootDragOver(false);
    setRootDragOverMiddle(false);
    setMaxDepthWarning(null);
    setIsEditMode(false);
  };

  // 가장 바깥쪽으로 이동 (첫 번째 2단계 폴더 위쪽 테두리 드롭 핸들러)
  const handleTopBorderDragOver = (
    e: React.DragEvent,
    isFirstSecondLevel: boolean
  ) => {
    if (!isFirstSecondLevel || !isEditMode) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    const draggedId = draggedFolderId;
    if (!draggedId || !rootFolder) {
      e.dataTransfer.dropEffect = 'none';
      setRootDragOver(false);
      return;
    }

    const draggedFolder = folders.find((f) => f.id === draggedId);
    if (
      draggedFolder &&
      draggedFolder.parentId !== null &&
      !isSecondLevelFolder(draggedFolder)
    ) {
      e.dataTransfer.dropEffect = 'move';
      setRootDragOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';
      setRootDragOver(false);
    }
  };

  const handleTopBorderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setRootDragOver(false);
    }
  };

  const handleTopBorderDrop = (
    e: React.DragEvent,
    isFirstSecondLevel: boolean
  ) => {
    if (!isFirstSecondLevel || !isEditMode) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();
    setRootDragOver(false);

    const draggedId =
      draggedFolderId || Number(e.dataTransfer.getData('text/plain'));
    if (!draggedId || !rootFolder) return;

    const draggedFolder = folders.find((f) => f.id === draggedId);
    if (
      draggedFolder &&
      draggedFolder.parentId !== null &&
      !isSecondLevelFolder(draggedFolder)
    ) {
      handleMoveFolder(draggedId, rootFolder.id);
      setDraggedFolderId(null);
      setIsEditMode(false);
    }
  };

  // 드롭 영역 위에 있을 때
  const handleDropZoneDragOver = (e: React.DragEvent, folder: Folder) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isEditMode) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    const draggedId = draggedFolderId;
    if (!draggedId || draggedId === folder.id) {
      e.dataTransfer.dropEffect = 'none';
      setDragOverFolderId(null);
      return;
    }

    if (draggedId === folder.id || isDirectParent(draggedId, folder.id)) {
      e.dataTransfer.dropEffect = 'none';
      setDragOverFolderId(null);
      return;
    }

    const draggedFolder = folders.find((f) => f.id === draggedId);
    if (!draggedFolder) {
      e.dataTransfer.dropEffect = 'none';
      setDragOverFolderId(null);
      return;
    }

    const draggedFolderLevel = getFolderLevel(draggedFolder);
    const targetFolderLevel = getFolderLevel(folder);

    if (targetFolderLevel >= 6) {
      e.dataTransfer.dropEffect = 'none';
      setDragOverFolderId(null);
      setMaxDepthWarning(folder.id);
      return;
    }

    setMaxDepthWarning(null);

    if (
      draggedFolderLevel === targetFolderLevel &&
      draggedFolderLevel >= 4 &&
      draggedFolderLevel < 6
    ) {
      e.dataTransfer.dropEffect = 'move';
      setDragOverFolderId(folder.id);
      return;
    }

    e.dataTransfer.dropEffect = 'move';
    setDragOverFolderId(folder.id);
  };

  // 드롭 영역에서 벗어날 때
  const handleDropZoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setDragOverFolderId(null);
      setMaxDepthWarning(null);
    }
  };

  // 드롭 처리
  const handleDropZoneDrop = (e: React.DragEvent, folder: Folder) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverFolderId(null);

    if (!isEditMode) {
      return;
    }

    const draggedId =
      draggedFolderId || Number(e.dataTransfer.getData('text/plain'));

    if (!draggedId || draggedId === folder.id) {
      return;
    }

    const draggedFolder = folders.find((f) => f.id === draggedId);
    if (!draggedFolder) {
      return;
    }

    const draggedFolderLevel = getFolderLevel(draggedFolder);
    const targetFolderLevel = getFolderLevel(folder);

    if (targetFolderLevel >= 6) {
      showError('최대 깊이 제한입니다.');
      setDraggedFolderId(null);
      setMaxDepthWarning(null);
      setIsEditMode(false);
      return;
    }

    if (
      draggedFolderLevel === targetFolderLevel &&
      draggedFolderLevel >= 4 &&
      draggedFolderLevel < 6
    ) {
      handleMoveFolder(draggedId, folder.id);
      setDraggedFolderId(null);
      setIsEditMode(false);
      return;
    }

    if (isDirectParent(draggedId, folder.id)) {
      showWarning('직접 부모 폴더로는 이동할 수 없습니다.');
      return;
    }

    handleMoveFolder(draggedId, folder.id);
    setDraggedFolderId(null);
    setIsEditMode(false);
  };

  // 루트 레벨 드롭 영역 핸들러 (2단계 폴더 목록 끝)
  const handleRootMiddleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isEditMode) {
      e.dataTransfer.dropEffect = 'none';
      return;
    }

    const draggedId = draggedFolderId;
    if (!draggedId || !rootFolder) return;

    const draggedFolder = folders.find((f) => f.id === draggedId);
    if (
      draggedFolder &&
      draggedFolder.parentId !== null &&
      !isSecondLevelFolder(draggedFolder)
    ) {
      e.dataTransfer.dropEffect = 'move';
      setRootDragOverMiddle(true);
    } else {
      e.dataTransfer.dropEffect = 'none';
      setRootDragOverMiddle(false);
    }
  };

  const handleRootMiddleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (
      !relatedTarget ||
      !e.currentTarget.contains(relatedTarget)
    ) {
      setRootDragOverMiddle(false);
    }
  };

  const handleRootMiddleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRootDragOverMiddle(false);

    if (!isEditMode) {
      return;
    }

    const draggedId =
      draggedFolderId || Number(e.dataTransfer.getData('text/plain'));
    if (!draggedId || !rootFolder) return;

    const draggedFolder = folders.find((f) => f.id === draggedId);
    if (
      draggedFolder &&
      draggedFolder.parentId !== null &&
      !isSecondLevelFolder(draggedFolder)
    ) {
      handleMoveFolder(draggedId, rootFolder.id);
      setDraggedFolderId(null);
      setIsEditMode(false);
    }
  };

  return {
    isMoving,
    targetFolderId,
    selectedFolderId,
    selectedFileId,
    handleMoveFolder,
    handleMoveFile,
    setTargetFolderId,
    openMoveModal,
    openFileMoveModal,
    closeMoveModal,
    // 드래그앤드롭 관련
    draggedFolderId,
    dragOverFolderId,
    rootDragOver,
    rootDragOverMiddle,
    isEditMode,
    maxDepthWarning,
    handleDragStart,
    handleDragEnd,
    handleTopBorderDragOver,
    handleTopBorderDragLeave,
    handleTopBorderDrop,
    handleDropZoneDragOver,
    handleDropZoneDragLeave,
    handleDropZoneDrop,
    handleRootMiddleDragOver,
    handleRootMiddleDragLeave,
    handleRootMiddleDrop,
    getFolderLevel,
    isSecondLevelFolder,
  };
};
