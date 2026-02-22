import type { ScriptItemDetail } from '../../types/report';
import { useEffect, useRef } from 'react';
import { MessageSquareDot, MessageSquarePlus } from 'lucide-react';

const formatMsToTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds
    .toString()
    .padStart(2, '0')}`;
};

interface ReportScriptItemProps {
  script: ScriptItemDetail;
  onScriptClick: (startTimeInMs: number) => void;
  onOpenComments: (payload: {
    script: ScriptItemDetail;
    rect: DOMRect;
  }) => void;
  activeScriptId?: number;
}

function ReportScriptItem({
  script,
  onScriptClick,
  onOpenComments,
  activeScriptId,
}: ReportScriptItemProps) {
  const isActive = activeScriptId === script.id;
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isActive) {
      containerRef.current?.scrollIntoView({
        block: 'center',
        behavior: 'smooth',
      });
    }
  }, [isActive]);
  const handleCardClick = () => {
    // 카드 전체 클릭 → 비디오 시간 이동
    onScriptClick(script.startTime);
  };

  const handleOpenComments = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 버튼 클릭 시 카드 클릭 전파 막기
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    onOpenComments({ script, rect });
  };

  return (
    <div
      ref={containerRef}
      role='button'
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className={`px-5.5 cursor-pointer rounded-lg py-3.5 transition-colors ${
        isActive ? '' : 'hover:bg-gray-100'
      }`}
      title='클릭하면 해당 시점으로 이동합니다'
    >
      {/* 상단 행: 좌측(화자/시간) ↔ 우측(댓글 아이콘) */}
      <div className='flex items-center justify-between'>
        <p className='text-sm font-semibold text-gray-800'>
          {script.speaker}
          <span className='ml-2 text-xs font-normal text-gray-500'>
            {formatMsToTime(script.startTime)}
          </span>
        </p>

        <div className='flex items-center'>
          {script.hasComments ? (
            <button
              type='button'
              onClick={handleOpenComments}
              className='rounded p-1 text-blue-600 hover:bg-blue-50'
              aria-label={`스크립트 #${script.id} 댓글 보기`}
              title='댓글 보기'
            >
              <MessageSquareDot className='h-4 w-4' />
            </button>
          ) : (
            <button
              type='button'
              onClick={handleOpenComments}
              className='rounded p-1 text-gray-600 hover:bg-gray-50'
              aria-label={`스크립트 #${script.id} 댓글 작성`}
              title='댓글 작성'
            >
              <MessageSquarePlus className='h-4 w-4' />
            </button>
          )}
        </div>
      </div>

      {/* 본문 */}
      <p className={`mt-1 ${isActive ? 'font-semibold' : 'text-gray-700'}`}>
        {isActive ? (
          <span className='inline-block rounded bg-yellow-300 px-1'>
            {script.content}
          </span>
        ) : (
          script.content
        )}
      </p>
    </div>
  );
}

export default ReportScriptItem;
