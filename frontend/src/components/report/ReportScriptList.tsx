import type { ScriptItemDetail } from '../../types/report';
import ReportScriptItem from './ReportSriptItem';

interface ReportScriptListProps {
  scripts: ScriptItemDetail[];
  isLoading: boolean;
  error: string | null;
  onScriptClick: (startTimeInMs: number) => void;
  onLoadMore: () => void;
  hasMore: boolean | undefined;
  onOpenComments: (payload: {
    script: ScriptItemDetail;
    rect: DOMRect;
  }) => void;
  activeScriptId?: number;
}

function ReportScriptList({
  scripts,
  isLoading,
  error,
  onScriptClick,
  // onLoadMore,
  // hasMore,
  onOpenComments,
  activeScriptId,
}: ReportScriptListProps) {
  // 더미데이터 확인
  if (!scripts || scripts.length === 0) {
    scripts = [
      {
        id: 1,
        speaker: '진행자',
        content: '더미 스크립트 #1 - 회의 시작 안내 및 목적 설명',
        startTime: 0,
        endTime: 15000,
        hasComments: true,
      },
      {
        id: 2,
        speaker: '참가자 A',
        content: '더미 스크립트 #2 - 안건 1에 대한 의견 개진',
        startTime: 15000,
        endTime: 30000,
        hasComments: false,
      },
      {
        id: 3,
        speaker: '참가자 B',
        content: '더미 스크립트 #3 - 보충 설명 및 추가 아이디어 제시',
        startTime: 30000,
        endTime: 45000,
        hasComments: true,
      },
    ];
  }

  if (error) {
    return <div className='p-6 text-red-500'>스크립트 로딩 실패: {error}</div>;
  }

  return (
    <div className='p-2'>
      <h2 className='mb-4 text-2xl font-semibold'>회의 기록</h2>

      {/* 더 보기 버튼 */}
      {/* {hasMore && !isLoading && (
        <button
          onClick={onLoadMore}
          className='mb-4 w-full rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50'
        >
          이전 기록 더 보기
        </button>
      )} */}

      {/* 스크립트 목록 */}
      <div className='flex max-h-96 flex-col gap-4 overflow-y-auto pr-2'>
        {scripts.map((script) => (
          <ReportScriptItem
            key={script.id}
            script={script}
            onScriptClick={onScriptClick}
            onOpenComments={onOpenComments}
            activeScriptId={activeScriptId}
          />
        ))}
      </div>

      {isLoading && (
        <div className='mt-4 flex justify-center p-4'>
          <p>스크립트 로딩 중...</p>
        </div>
      )}
    </div>
  );
}

export default ReportScriptList;
