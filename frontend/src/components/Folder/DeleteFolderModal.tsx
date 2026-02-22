interface DeleteFolderModalProps {
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteFolderModal({
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteFolderModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-96 rounded-lg bg-white p-6 shadow-lg'>
        <h3 className='mb-4 text-lg font-semibold'>폴더 삭제</h3>
        <p className='mb-4 text-sm text-gray-600'>
          정말로 이 폴더를 삭제하시겠습니까?<br />
          삭제된 폴더는 복구할 수 없습니다.
        </p>

        <div className='flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300'
            disabled={isDeleting}
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className='rounded bg-red-500 px-4 py-2 text-sm text-white hover:bg-red-600 disabled:opacity-50'
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteFolderModal;

