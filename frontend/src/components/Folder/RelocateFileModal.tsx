import type { Folder } from '../../types/Folder';

interface RelocateFileModalProps {
  isOpen: boolean;
  folders: Folder[];
  targetFolderId: number | null;
  selectedFileId: number;
  isMoving: boolean;
  onClose: () => void;
  onTargetChange: (folderId: number) => void;
  onSubmit: (fileId: number, targetId: number) => void;
  onWarning: (message: string) => void;
}

function RelocateFileModal({
  isOpen,
  folders,
  targetFolderId,
  selectedFileId,
  isMoving,
  onClose,
  onTargetChange,
  onSubmit,
  onWarning,
}: RelocateFileModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-96 rounded-lg bg-white p-6 shadow-lg'>
        <h3 className='mb-4 text-lg font-semibold'>파일 이동</h3>
        <p className='mb-4 text-sm text-gray-600'>
          이동할 대상 폴더를 선택해주세요.
        </p>

        <div className='mb-4 max-h-64 overflow-y-auto'>
          <label className='mb-2 block text-sm font-medium'>
            이동 대상 폴더
          </label>
          <select
            value={targetFolderId || ''}
            onChange={(e) => onTargetChange(Number(e.target.value))}
            className='w-full rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black focus:border-black'
          >
            <option value=''>선택하세요</option>
            {folders
              .filter((f) => f.parentId !== null)
              .map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
          </select>
        </div>

        <div className='flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300'
            disabled={isMoving}
          >
            취소
          </button>
          <button
            onClick={() => {
              if (targetFolderId !== null) {
                onSubmit(selectedFileId, targetFolderId);
              } else {
                onWarning('이동할 대상 폴더를 선택해주세요.');
              }
            }}
            disabled={isMoving || targetFolderId === null}
            className='rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50'
          >
            {isMoving ? '이동 중...' : '이동'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RelocateFileModal;

