import { useState } from 'react';
import { useParams } from 'react-router-dom';
// import { shareReport } from '../../api/reportService';
import { useToastStore } from '../../store/useToastStore';
import useReportDetail from '../../hooks/report/useReportDetail';
import useReportScript from '../../hooks/report/useReportScript';
import useDeleteReport from '../../hooks/report/useDeleteReport';
import useScriptComments from '../../hooks/report/useScriptComments';

import ReportHeader from './ReportHeader';
import ReportVideo from './ReportVideo';
import ReportAnalysis from './ReportAnalysis';
import ReportScriptList from './ReportScriptList';
import CommentPopover from './CommentPopover';
import ShareReportModal from './ShareReportModal';
import { useToast } from '../../hooks/common/useToast';
import { useShareReport } from '../../hooks/report/useShareReport';

import type { ScriptItemDetail } from '../../types/report';

type OpenCommentsState = { script: ScriptItemDetail; rect: DOMRect } | null;

// duration(초)을 "O분 O초" 문자열로 변환
const formatDuration = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return '0초';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) {
    return `${minutes}분 ${remainingSeconds}초`;
  }
  return `${remainingSeconds}초`;
};

const ReportDetail = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [openComments, setOpenComments] = useState<OpenCommentsState>(null);
  const [activeScriptId, setActiveScriptId] = useState<number | undefined>(undefined);

  const {
    data: reportData,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useReportDetail(meetingId);

  const {
    data: scripts,
    isLoading: isLoadingTranscriptFirstPage,
    isFetchingNextPage: isLoadingTranscriptNextPage,
    error: transcriptError,
    loadNextPage,
    pageInfo,
    goToPage,
  } = useReportScript(meetingId);

  const { deleteReport, isDeleting } = useDeleteReport();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { grant, isGranting } = useShareReport();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const addToast = useToastStore((state) => state.addToast);
  const { showSuccess, showError } = useToast();

  // 비디오 시간 이동 상태
  const [jumpTime, setJumpTime] = useState<number | null>(null);

  const isLoading = isLoadingDetail || isLoadingTranscriptFirstPage;
  const error = detailError || transcriptError;

  // 댓글 데이터 로딩 훅 (팝오버 열릴 때만 활성화)
  const commentsEnabled = !!openComments && !!meetingId;
  const openScriptId = openComments ? String(openComments.script.id) : '';
  const { data: commentData, addComment, isCreating } = useScriptComments(
    meetingId ?? '',
    openScriptId,
    commentsEnabled
  );

  // 로딩 및 에러 UI
  if (isLoading) {
    return <div className='p-8'>로딩 중...</div>;
  }

  if (error) {
    if (transcriptError && reportData) {
      console.error('스크립트 로딩 실패:', transcriptError);
    } else {
      return <div className='p-8 text-red-500'>에러: {error}</div>;
    }
  }

  if (!reportData) {
    return <div className='p-8'>리포트 데이터를 찾을 수 없습니다.</div>;
  }

  // 삭제 버튼 핸들러 (헤더에서 사용)
  const handleDeleteClick = async () => {
    if (!meetingId || isDeleting) return;
    setShowDeleteModal(true);
  };

  // 공유 버튼 클릭 시: 공유 모달 열기 (API 연동 없음)
  const handleShareClick = () => {
    if (!meetingId) {
      addToast({ type: 'error', message: '미팅 ID를 찾을 수 없습니다.' });
      return;
    }
    setIsShareModalOpen(true);
  };

  const handleShareSubmit = async (payload: { email: string; permission: 'VIEWER' | 'EDITOR' }) => {
    if (!meetingId || isGranting) return;
    try {
      await grant(meetingId, payload);
      showSuccess('공유가 완료되었습니다.');
      setIsShareModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '공유에 실패했습니다.';
      showError(msg);
    }
  };

  // 스크립트 클릭 핸들러
  const handleScriptClick = (startTimeInMs: number) => {
    setJumpTime(startTimeInMs / 1000);
  };

  // 비디오 재생 시간 업데이트 → 스크립트 자동 동기화
  const handleVideoTimeUpdate = (currentTimeSec: number) => {
    if (!scripts || scripts.length === 0) return;
    const tMs = Math.floor(currentTimeSec * 1000);
    const current = scripts.find(
      (s) => s.startTime <= tMs && tMs < s.endTime
    );
    if (current && current.id !== activeScriptId) {
      setActiveScriptId(current.id);
    }
  };

  return (
    <div className='flex-1 overflow-y-auto bg-gray-50 p-8'>
      <ReportHeader
        title={reportData.name}
        // presenter={reportData.presenter}
        date={new Date(reportData.createdAt).toLocaleString()}
        duration={formatDuration(reportData.duration)}
        isSharing={isGranting}
        onShareClick={handleShareClick}
        isDeleting={isDeleting}
        onDeleteClick={handleDeleteClick}
      />

      <div className='mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          {/* 비디오 뷰어 */}
          <ReportVideo
            videoUrl={reportData.videoUrl}
            title={reportData.name}
          jumpTime={jumpTime}
          onTimeUpdate={handleVideoTimeUpdate}
          />
        </div>

        {/* 요약/키워드 분석 */}
        <div className='lg:col-span-1 lg:row-span-2'>
          <ReportAnalysis
            reportId={meetingId!}
            initialKeywords={reportData.summary.keyword}
            initialSummary={reportData.summary.content}
          />
        </div>

        {/* 스크립트 리스트 */}
        <div className='lg:col-span-2'>
          <ReportScriptList
            key={pageInfo?.currentPage}
            scripts={scripts || []}
            isLoading={isLoadingTranscriptNextPage}
            // error={transcriptError}
            error={null}
            onScriptClick={handleScriptClick}
            onLoadMore={loadNextPage}
            hasMore={!pageInfo?.last}
            onOpenComments={(payload) => setOpenComments(payload)}
            activeScriptId={openComments?.script.id ?? activeScriptId}
          />
        </div>
        {/* 페이지네이션 바 */}
        {pageInfo && pageInfo.totalPages > 0 && (
          <div className='lg:col-span-2'>
            <div className='mt-4 flex justify-center'>
              <nav className='flex items-center gap-2'>
                {Array.from({ length: pageInfo.totalPages }, (_, idx) => {
                  const page = idx + 1;
                  const isActive = pageInfo.currentPage === page;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      disabled={
                        isActive ||
                        isLoadingTranscriptFirstPage ||
                        isLoadingTranscriptNextPage
                      }
                      className={`inline-flex h-8 min-w-8 items-center justify-center rounded border px-3 text-sm ${
                        isActive
                          ? 'border-blue-600 bg-blue-600 text-white'
                          : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}
      </div>

      {openComments && (
        <CommentPopover
          target={openComments}
          onClose={() => setOpenComments(null)}
          comments={commentData?.comments ?? []}
          onSubmit={addComment}
          submitting={isCreating}
        />
      )}

      <ShareReportModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onSubmit={handleShareSubmit}
        submitting={isGranting}
        reportId={meetingId!}
      />

      {showDeleteModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <section className='m-6 w-full max-w-md rounded-2xl border border-meethub-blue bg-white p-8'>
            <div className='text-center'>
              <h3 className='mb-4 text-lg font-bold text-black'>회의록 삭제</h3>
              <p className='mb-6 text-gray-600'>정말로 삭제하시겠습니까?<br/>삭제 후에는 복구할 수 없습니다.</p>
              <div className='flex space-x-3'>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className='flex-1 rounded-md bg-gray-300 px-6 py-3 font-medium text-black shadow-md transition-colors duration-200 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50'
                  disabled={isDeleting}
                >
                  취소
                </button>
                <button
                  onClick={async () => {
                    if (!meetingId || isDeleting) return;
                    const ok = await deleteReport(meetingId, { skipConfirm: true });
                    if (ok) setShowDeleteModal(false);
                  }}
                  className='flex-1 rounded-md bg-red-500 px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-70'
                  disabled={isDeleting}
                >
                  삭제하기
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ReportDetail;
