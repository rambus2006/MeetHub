interface EditFileNameModalProps {
  isOpen: boolean;
  newName: string;
  isUpdating: boolean;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

function EditFileNameModal({
  isOpen,
  newName,
  isUpdating,
  onClose,
  onNameChange,
  onSubmit,
}: EditFileNameModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-96 rounded-lg bg-white p-6 shadow-lg'>
        <h3 className='mb-4 text-lg font-semibold'>파일 이름 수정</h3>
        <p className='mb-4 text-sm text-gray-600'>
          새로운 이름을 입력해주세요.
        </p>

        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium'>이름</label>
          <input
            type='text'
            value={newName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder='새 이름'
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSubmit();
              }
            }}
            className='w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400'
            autoFocus
          />
        </div>

        <div className='flex justify-end gap-2'>
          <button
            onClick={onClose}
            className='rounded bg-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-300'
            disabled={isUpdating}
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={isUpdating}
            className='rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50'
          >
            {isUpdating ? '수정 중...' : '수정'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditFileNameModal;

