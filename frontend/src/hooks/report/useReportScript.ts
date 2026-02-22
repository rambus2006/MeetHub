import { useState, useEffect, useCallback } from 'react';
import { getScriptList } from '../../api/reportService';
import type { ScriptItemDetail, PaginationInfo } from '../../types/report';

/**
 * 리포트의 스크립트 목록을 페이징하여 조회하는 커스텀 훅
 * @param reportId - 조회할 리포트의 ID
 */
function useReportScript(reportId: string | undefined) {
  const [scripts, setScripts] = useState<ScriptItemDetail[]>([]);
  const [pageInfo, setPageInfo] = useState<PaginationInfo | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setScripts([]);
      setPageInfo(null);
      setIsLoading(false);
      setError('리포트 ID가 없습니다.');
      return;
    }

    const fetchData = async () => {
      if (currentPage === 1) {
        setIsLoading(true);
      } else {
        setIsFetchingNextPage(true);
      }
      setError(null);

      try {
        const response = await getScriptList(reportId, currentPage);

        if (response.success && response.content) {
          const { content: newScripts, ...pagination } = response.content;

          // 새로운 페이지(이동)의 스크립트로 갱신
          setScripts(() => newScripts);
          // UI는 항상 1부터 시작
          const normalizedPagination = {
            ...pagination,
            currentPage:
              typeof pagination.currentPage === 'number'
                ? pagination.currentPage
                : currentPage,
          } as typeof pagination;
          setPageInfo(normalizedPagination as any);
        } else {
          throw new Error(
            response.message || '스크립트 목록을 불러오는 데 실패했습니다.'
          );
        }
      } catch (err: any) {
        console.error('useReportTranscript Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
        setIsFetchingNextPage(false);
      }
    };

    fetchData();
  }, [reportId, currentPage]);

  const loadNextPage = useCallback(() => {
    if (pageInfo && !pageInfo.last && !isFetchingNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [pageInfo, isFetchingNextPage]);

  const goToPage = useCallback(
    (page: number) => {
      if (!pageInfo) return;
      if (page === pageInfo.currentPage) return;
      if (page < 1 || page > pageInfo.totalPages) return;
      setScripts([]);
      setCurrentPage(page);
    },
    [pageInfo]
  );

  const totalPages = pageInfo?.totalPages;

  return {
    data: scripts,
    isLoading,
    isFetchingNextPage,
    error,
    pageInfo,
    loadNextPage,
    goToPage,
    totalPages,
  };
}

export default useReportScript;
