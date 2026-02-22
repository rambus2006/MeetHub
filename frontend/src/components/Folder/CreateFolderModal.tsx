interface CreateFolderModalProps {
  isOpen: boolean;
  newFolderName: string;
  isCreating: boolean;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onSubmit: () => void;
}

function CreateFolderModal({
  isOpen,
  newFolderName,
  isCreating,
  onClose,
  onNameChange,
  onSubmit,
}: CreateFolderModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-96 rounded-lg bg-white p-6 shadow-lg'>
        <h3 className='mb-4 text-lg font-semibold'>폴더 생성</h3>
        <p className='mb-4 text-sm text-gray-600'>
          새로 생성할 폴더 이름을 입력해주세요.
        </p>

        <div className='mb-4'>
          <label className='mb-2 block text-sm font-medium'>폴더 이름</label>
          <input
            type='text'
            value={newFolderName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder='새 폴더 이름'
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
            disabled={isCreating}
          >
            취소
          </button>
          <button
            onClick={onSubmit}
            disabled={isCreating}
            className='rounded bg-black px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50'
          >
            {isCreating ? '생성 중...' : '생성'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFolderModal;

