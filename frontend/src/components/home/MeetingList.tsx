import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFolderList } from '../../hooks/Folder/useListFolder';
import { useFolderMake } from '../../hooks/Folder/useCreateFolder';
import { useFolderMove } from '../../hooks/Folder/useMoveFolder';
import { useDeleteFolder } from '../../hooks/Folder/useDeleteFolder';
import { useEditNameFolder } from '../../hooks/Folder/useEditNameFolder';
import { useToast } from '../../hooks/common/useToast';
import CreateFolderModal from '../Folder/CreateFolderModal';
import EditFolderNameModal from '../Folder/EditFolderNameModal';
import EditFileNameModal from '../Folder/EditFileNameModal';
import RelocateFolderModal from '../Folder/RelocateFolderModal';
import RelocateFileModal from '../Folder/RelocateFileModal';
import DeleteFolderModal from '../Folder/DeleteFolderModal';

function MeetingList() {
  // 토스트 창
  const { showWarning } = useToast();

  // 폴더 목록 관리 훅 사용
  const {
    folders = [],
    folderFiles = {},
    expandedFolders = {},
    isLoading,
    loadFolders,
    toggleFolder,
  } = useFolderList();

  // 폴더 생성 관리 훅 사용
  const {
    newFolderName,
    isCreating,
    isModalOpen,
    handleCreateFolder,
    setNewFolderName,
    openCreateModal,
    closeCreateModal,
  } = useFolderMake(loadFolders);

  // 폴더/파일 이동 관리 훅 사용
  const {
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
  } = useFolderMove(loadFolders, folders);

  // 폴더 삭제 관리 훅 사용
  const {
    isDeleting,
    selectedFolderId: selectedDeleteFolderId,
    handleDeleteFolder,
    openDeleteModal,
    closeDeleteModal,
  } = useDeleteFolder(loadFolders);

  // 폴더/파일 이름 수정 관리 훅 사용
  const {
    isUpdating,
    isModalOpen: isEditModalOpen,
    newName,
    setNewName,
    selectedItemType,
    handleUpdateName,
    openFolderEditModal,
    openFileEditModal,
    closeEditModal,
  } = useEditNameFolder(loadFolders);

  // 페이지 네비게이션 훅
  const navigate = useNavigate();

  /**
   * 파일(회의) 클릭 핸들러
   * 파일 ID를 검증하고 리포트 상세 페이지로 이동
   * @param fileId - 이동할 파일(회의)의 ID
   */
  const handleFileClick = (fileId: number) => {
    if (!fileId || isNaN(fileId)) {
      console.error('Invalid file ID:', fileId);
      return;
    }
    navigate(`/reports/${fileId}`);
  };

  /**
   * 특정 부모 폴더의 하위 폴더 목록을 반환
   * @param parentId - 부모 폴더의 ID (null인 경우 최상위 폴더)
   * @returns 해당 부모 폴더의 자식 폴더 배열
   */
  const getChildFolders = (parentId: number | null) => {
    if (!Array.isArray(folders)) return [];
    return folders.filter((folder) => folder?.parentId === parentId);
  };

  /**
   * 최상위 폴더 찾기 (1단계 폴더)
   * parentId가 null인 폴더를 찾아 반환
   */
  const rootFolder = Array.isArray(folders)
    ? folders.find((folder) => folder?.parentId === null)
    : undefined;

  /**
   * 2단계 폴더 목록 가져오기
   * 1단계 폴더(rootFolder)의 직접 자식 폴더들을 반환
   * @returns 2단계 폴더 배열
   */
  const getSecondLevelFolders = () => {
    if (!rootFolder || !rootFolder.id || !Array.isArray(folders)) return [];
    return folders.filter((folder) => folder?.parentId === rootFolder.id);
  };

  /**
   * 폴더 아이템 컴포넌트 (재귀적 렌더링)
   * 2단계, 3단계, 4단계 등 모든 레벨의 폴더를 재귀적으로 표시
   * @param folder - 표시할 폴더 객체
   * @param isFirstSecondLevel - 첫 번째 2단계 폴더인지 여부 (드래그앤드롭용)
   */
  const FolderItem = ({
    folder,
    isFirstSecondLevel = false,
  }: {
    folder: (typeof folders)[0];
    isFirstSecondLevel?: boolean;
  }) => {
    // 현재 폴더가 드래그 중인지 여부를 관리하는 상태
    const [isDragging, setIsDragging] = useState(false);

    // 폴더 유효성 검사
    if (!folder || !folder.id) {
      return null;
    }

    // 현재 폴더의 직접 자식 폴더 목록
    const childFolders = getChildFolders(folder.id);
    // 현재 폴더의 파일 목록이 로드되었는지 여부
    const filesLoaded = folderFiles?.[folder.id] !== undefined;
    // 현재 폴더의 파일 목록
    const currentFiles = folderFiles?.[folder.id];
    // 현재 폴더에 파일이 있는지 여부
    const hasFiles =
      filesLoaded && Array.isArray(currentFiles) && currentFiles.length > 0;
    // 현재 폴더에 자식 폴더나 파일이 있는지 여부
    const hasChildren = childFolders.length > 0 || hasFiles;

    // 현재 폴더 위에 드래그 중인 아이템이 있는지 여부
    const isDragOver = dragOverFolderId === folder.id;

    return (
      <div className='relative'>
        {/* 첫 번째 2단계 폴더 위쪽 테두리 (가장 바깥쪽으로 이동용) */}
        {isFirstSecondLevel && isEditMode && (
          <div
            onDragOver={(e) => {
              try {
                handleTopBorderDragOver?.(e, isFirstSecondLevel);
              } catch (error) {
                console.error('Top border drag over error:', error);
              }
            }}
            onDragLeave={(e) => {
              try {
                handleTopBorderDragLeave?.(e);
              } catch (error) {
                console.error('Top border drag leave error:', error);
              }
            }}
            onDrop={(e) => {
              try {
                handleTopBorderDrop?.(e, isFirstSecondLevel);
              } catch (error) {
                console.error('Top border drop error:', error);
              }
            }}
            className={`relative mb-2 ml-8 h-1 transition-all ${
              rootDragOver ? 'bg-blue-500' : 'bg-blue-300'
            }`}
          >
            {rootDragOver && (
              <div className='absolute -top-6 left-0 right-0 flex items-center justify-start'>
                <span className='bg-white px-2 text-xs font-semibold text-blue-600'>
                  여기에 드롭하여 2단계 폴더로 이동
                </span>
              </div>
            )}
          </div>
        )}
        {/* 폴더 헤더 */}
        <div className={`rounded-lg ${isDragging ? 'opacity-50' : ''}`}>
          <div className='flex items-center gap-2 p-2'>
            {/* 폴더 이름 영역 (드래그 및 드롭 가능) */}
            <div
              draggable={true}
              onDragStart={(e) => {
                try {
                  setIsDragging(true);
                  handleDragStart?.(e, folder.id);
                } catch (error) {
                  console.error('Drag start error:', error);
                  setIsDragging(false);
                }
              }}
              onDragEnd={() => {
                try {
                  setIsDragging(false);
                  handleDragEnd?.();
                } catch (error) {
                  console.error('Drag end error:', error);
                }
              }}
              onDragOver={(e) => {
                try {
                  handleDropZoneDragOver?.(e, folder);
                } catch (error) {
                  console.error('Drag over error:', error);
                }
              }}
              onDragLeave={(e) => {
                try {
                  handleDropZoneDragLeave?.(e);
                } catch (error) {
                  console.error('Drag leave error:', error);
                }
              }}
              onDrop={(e) => {
                try {
                  handleDropZoneDrop?.(e, folder);
                } catch (error) {
                  console.error('Drop error:', error);
                }
              }}
              className={`flex flex-1 cursor-move items-center rounded px-2 py-1 transition-all ${
                maxDepthWarning === folder.id && isEditMode
                  ? 'border-2 border-red-500 bg-red-100'
                  : isDragOver &&
                      isEditMode &&
                      (!rootFolder || folder.id !== rootFolder.id)
                    ? 'border-2 border-blue-500 bg-blue-100'
                    : ''
              }`}
            >
              <button
                onClick={() => {
                  try {
                    if (folder.id && toggleFolder) {
                      toggleFolder(folder.id);
                    }
                  } catch (error) {
                    console.error('Toggle folder error:', error);
                  }
                }}
                className='mr-2 flex items-center text-left hover:bg-gray-50 disabled:hover:bg-transparent'
                // disabled={!hasChildren}
                draggable={false}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <svg
                  className={`mr-2 h-4 w-4 transition-transform ${
                    expandedFolders?.[folder.id] ? 'rotate-90' : ''
                  } ${!hasChildren ? 'opacity-30' : ''}`}
                  fill='currentColor'
                  viewBox='0 0 20 20'
                >
                  <path
                    fillRule='evenodd'
                    d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
              <svg
                className='mr-2 h-4 w-4 flex-shrink-0 text-gray-600'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path d='M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z' />
              </svg>
              <span className='flex-1 font-medium'>
                {folder.name || '이름 없음'}
              </span>
              {maxDepthWarning === folder.id && isEditMode && (
                <span className='ml-2 text-xs font-semibold text-red-600'>
                  최대 깊이 제한입니다.
                </span>
              )}
              {isDragOver &&
                isEditMode &&
                (!rootFolder || folder.id !== rootFolder.id) &&
                maxDepthWarning !== folder.id && (
                  <span className='ml-2 text-xs font-semibold text-blue-600'>
                    여기에 드롭하여 {folder.name || '폴더'}로 이동
                  </span>
                )}
            </div>
            <button
              onClick={(e) => {
                try {
                  e.stopPropagation();
                  if (folder.id && openFolderEditModal) {
                    openFolderEditModal(folder.id, folder.name || '');
                  }
                } catch (error) {
                  console.error('Open edit modal error:', error);
                }
              }}
              className='rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100'
              title='폴더 이름 변경'
              draggable={false}
            >
              이름 변경
            </button>
            <button
              onClick={(e) => {
                try {
                  e.stopPropagation();
                  if (folder.id && openMoveModal) {
                    openMoveModal(folder.id);
                  }
                } catch (error) {
                  console.error('Open move modal error:', error);
                }
              }}
              className='rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100'
              title='폴더 이동'
              draggable={false}
            >
              이동
            </button>
            <button
              onClick={(e) => {
                try {
                  e.stopPropagation();
                  if (folder.id && openDeleteModal) {
                    openDeleteModal(folder.id);
                  }
                } catch (error) {
                  console.error('Open delete modal error:', error);
                }
              }}
              className='rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50'
              title='폴더 삭제'
              draggable={false}
            >
              삭제
            </button>
          </div>

          {/* 하위 폴더와 파일 목록 (재귀적으로 3단계, 4단계 등 모든 레벨 표시) */}
          {expandedFolders?.[folder.id] && (
            <div className='ml-6 mt-2'>
              <ul className='space-y-1'>
                {Array.isArray(childFolders) &&
                  childFolders.map((childFolder) => {
                    if (!childFolder || !childFolder.id) return null;
                    return (
                      <li key={childFolder.id}>
                        <FolderItem folder={childFolder} />
                      </li>
                    );
                  })}
                {/* 파일 목록 */}
                {filesLoaded &&
                Array.isArray(currentFiles) &&
                currentFiles.length > 0
                  ? currentFiles.map((file) => {
                      if (!file || !file.id) return null;
                      return (
                        <li key={file.id} className='flex items-center gap-2'>
                          <div
                            onClick={() => handleFileClick(file.id)}
                            className='flex flex-1 cursor-pointer items-center rounded px-2 py-1 hover:bg-gray-50'
                          >
                            <svg
                              className='mr-2 h-4 w-4 text-gray-500'
                              fill='currentColor'
                              viewBox='0 0 20 20'
                            >
                              <path
                                fillRule='evenodd'
                                d='M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z'
                                clipRule='evenodd'
                              />
                            </svg>
                            <span className='text-sm'>
                              {file.name || '이름 없음'}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              try {
                                e.stopPropagation();
                                if (file.id && openFileEditModal) {
                                  openFileEditModal(file.id, file.name || '');
                                }
                              } catch (error) {
                                console.error(
                                  'Open file edit modal error:',
                                  error
                                );
                              }
                            }}
                            className='rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100'
                            title='파일 이름 변경'
                          >
                            이름 변경
                          </button>
                          <button
                            onClick={(e) => {
                              try {
                                e.stopPropagation();
                                if (file.id && openFileMoveModal) {
                                  openFileMoveModal(file.id);
                                }
                              } catch (error) {
                                console.error(
                                  'Open file move modal error:',
                                  error
                                );
                              }
                            }}
                            className='rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100'
                            title='파일 이동'
                          >
                            이동
                          </button>
                        </li>
                      );
                    })
                  : null}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className='flex-1 bg-white p-6'>
      <div className='mb-2 flex items-center justify-between'>
        <h1 className='text-lg font-semibold'>회의목록</h1>
        {/* 폴더 추가 버튼 */}
        <button
          onClick={openCreateModal}
          className='rounded bg-black px-3 py-1 font-medium text-white transition-colors hover:bg-gray-800'
          title='폴더 추가'
        >
          +
        </button>
      </div>
      <hr className='mb-2 border-gray-300' />

      {/* 폴더 리스트 - 2단계와 3단계 폴더 표시 */}
      <div className='min-h-[200px] space-y-4'>
        {isLoading ? (
          <div className='text-center text-gray-500'>
            폴더 목록을 불러오는 중...
          </div>
        ) : folders.length === 0 ? (
          <div className='text-center text-gray-500'>폴더가 없습니다.</div>
        ) : rootFolder ? (
          <>
            {/* 2단계 폴더들만 표시 */}
            {getSecondLevelFolders().length > 0 ? (
              getSecondLevelFolders().map((folder, index) => {
                if (!folder || !folder.id) return null;
                return (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    isFirstSecondLevel={index === 0}
                  />
                );
              })
            ) : (
              <div className='py-8 text-center text-gray-500'>
                폴더가 없습니다. 위의 + 버튼을 눌러 폴더를 생성하세요.
              </div>
            )}

            {/* 루트 레벨 드롭 영역 (3단계 → 2단계 이동용) - 2단계 폴더 목록 끝 - 편집 모드일 때만 표시 */}
            {isEditMode && (
              <div
                onDragOver={(e) => {
                  try {
                    handleRootMiddleDragOver?.(e);
                  } catch (error) {
                    console.error('Root middle drag over error:', error);
                  }
                }}
                onDragLeave={(e) => {
                  try {
                    handleRootMiddleDragLeave?.(e);
                  } catch (error) {
                    console.error('Root middle drag leave error:', error);
                  }
                }}
                onDrop={(e) => {
                  try {
                    handleRootMiddleDrop?.(e);
                  } catch (error) {
                    console.error('Root middle drop error:', error);
                  }
                }}
                className={`relative mb-4 ml-8 mt-4 h-1 transition-all ${
                  rootDragOverMiddle ? 'bg-blue-500' : 'bg-blue-300'
                }`}
              >
                {rootDragOverMiddle && (
                  <div className='absolute -top-6 left-0 right-0 flex items-center justify-start'>
                    <span className='bg-white px-2 text-xs font-semibold text-blue-600'>
                      여기에 드롭하여 2단계 폴더로 이동
                    </span>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className='text-center text-gray-500'>
            최상위 폴더가 없습니다.
          </div>
        )}
      </div>

      {/* 폴더 생성 모달 */}
      <CreateFolderModal
        isOpen={isModalOpen}
        newFolderName={newFolderName}
        isCreating={isCreating}
        onClose={closeCreateModal}
        onNameChange={setNewFolderName}
        onSubmit={handleCreateFolder}
      />

      {/* 폴더 이동 모달 */}
      <RelocateFolderModal
        isOpen={selectedFolderId !== null}
        folders={folders}
        targetFolderId={targetFolderId}
        selectedFolderId={selectedFolderId || 0}
        isMoving={isMoving}
        onClose={closeMoveModal}
        onTargetChange={setTargetFolderId}
        onSubmit={handleMoveFolder}
        onWarning={showWarning}
      />

      {/* 파일 이동 모달 */}
      <RelocateFileModal
        isOpen={selectedFileId !== null}
        folders={folders}
        targetFolderId={targetFolderId}
        selectedFileId={selectedFileId || 0}
        isMoving={isMoving}
        onClose={closeMoveModal}
        onTargetChange={setTargetFolderId}
        onSubmit={handleMoveFile}
        onWarning={showWarning}
      />

      {/* 폴더 삭제 확인 모달 */}
      <DeleteFolderModal
        isOpen={selectedDeleteFolderId !== null}
        isDeleting={isDeleting}
        onClose={closeDeleteModal}
        onConfirm={() => {
          if (selectedDeleteFolderId !== null) {
            handleDeleteFolder(selectedDeleteFolderId);
          }
        }}
      />

      {/* 폴더 이름 수정 모달 */}
      <EditFolderNameModal
        isOpen={isEditModalOpen && selectedItemType === 'folder'}
        newName={newName}
        isUpdating={isUpdating}
        onClose={closeEditModal}
        onNameChange={setNewName}
        onSubmit={handleUpdateName}
      />

      {/* 파일 이름 수정 모달 */}
      <EditFileNameModal
        isOpen={isEditModalOpen && selectedItemType === 'file'}
        newName={newName}
        isUpdating={isUpdating}
        onClose={closeEditModal}
        onNameChange={setNewName}
        onSubmit={handleUpdateName}
      />
    </section>
  );
}

export default MeetingList;
