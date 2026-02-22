import { X } from 'lucide-react';
import { useToast } from '../../hooks/common/useToast';
import type { ShareModalProps } from '../../hooks/meeting/useShareMeeting';


function MeetingShareModal({ open, onClose, urlToShare }: ShareModalProps) {
  // 토스트 상태 관리
  const { showSuccess } = useToast();
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
      <div className='relative flex w-[90vw] max-w-md flex-col items-center rounded-lg bg-white p-6 shadow-lg'>
        {/* 모달창 header 부분 */}
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className='absolute right-4 top-4 text-gray-400 hover:text-gray-600'
          aria-label='닫기'
        >
          <X size={24} />
        </button>
        {/* 모달창 body */}
        {/* URL 복사 영역 */}
        <div className='flex w-full flex-col items-center'>
          <span className='mb-1 text-sm text-gray-600'>회의 ID 복사</span>
          <div className='mt-1 flex w-full'>
            <input
              className='flex-1 rounded-l border px-2 py-1 text-xs'
              value={urlToShare}
              readOnly
            />
            <button
              className='rounded-r bg-gray-200 px-3 text-sm hover:bg-gray-300'
              onClick={() => {
                navigator.clipboard.writeText(urlToShare);
                showSuccess('ID가 복사되었습니다!');
              }}
            >
              복사
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default MeetingShareModal;
