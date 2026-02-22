import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ScriptItemDetail, CommentDetail } from '../../types/report';

type CommentPopoverProps = {
  target: { script: ScriptItemDetail; rect: DOMRect };
  onClose: () => void;
  comments: CommentDetail[];
  onSubmit?: (content: string) => Promise<void> | void;
  submitting?: boolean;
};

function CommentPopover({
  target,
  onClose,
  comments,
  onSubmit,
  submitting,
}: CommentPopoverProps) {
  // 뷰포트 기준 위치 (오른쪽 8px 벌리고, 화면 밖 안나가게 보정)
  const left = Math.min(target.rect.right + 8, window.innerWidth - 340);
  const top = Math.min(target.rect.top, window.innerHeight - 300);

  // 리사이즈 / ESC 키로 닫기 (전역 스크롤은 닫지 않음)
  useEffect(() => {
    const handleResize = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className='fixed inset-0 z-[100]' onClick={onClose}>
      <div className='absolute inset-0 bg-transparent' />
      <div
        className='absolute w-80 rounded-lg border border-gray-200 bg-white shadow-xl'
        style={{ left, top }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='flex items-center justify-between border-b border-gray-200 p-3'>
          <h3 className='text-sm font-semibold'>댓글</h3>
          <button
            onClick={onClose}
            className='rounded p-1 text-gray-500 hover:bg-gray-100'
          >
            닫기
          </button>
        </div>

        <div className='max-h-60 space-y-3 overflow-y-auto p-3'>
          {comments.length === 0 ? (
            <p className='text-sm text-gray-500'>아직 댓글이 없습니다.</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className='text-sm'>
                <p className='font-semibold text-gray-800'>
                  {c.userName}
                  <span className='ml-2 text-xs font-normal text-gray-400'>
                    {new Date(c.createdAt).toLocaleString()}
                  </span>
                </p>
                <p className='mt-1 break-words text-gray-700'>{c.content}</p>
              </div>
            ))
          )}
        </div>

        <div className='border-t border-gray-200 p-3'>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!onSubmit) return;
              const f = e.target as HTMLFormElement;
              const input = f.elements.namedItem('comment') as HTMLInputElement;
              const content = input.value.trim();
              if (!content) return;
              await onSubmit(content);
              f.reset();
            }}
          >
            <input
              name='comment'
              placeholder='댓글 작성...'
              className='w-full rounded border border-gray-300 p-2 text-sm'
              disabled={submitting}
            />
            <button
              className='mt-2 w-full rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700 disabled:opacity-60'
              disabled={submitting}
            >
              {submitting ? '등록 중...' : '등록'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default CommentPopover;
