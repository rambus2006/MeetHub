import { useState, useEffect } from 'react';
import type { CommentListContent } from '../../types/report';
import { getScriptComments, createComment as requestCreateComment } from '../../api/reportService';
import { useToast } from '../common/useToast';

/**
 * 특정 스크립트의 댓글 목록을 조회하는 커스텀 훅
 * @param reportId - 리포트 ID
 * @param scriptId - 스크립트 ID
 * @param enabled - true일 때만 API 호출 (예: 팝오버 열렸을 때)
 */
function useScriptComments(reportId: string, scriptId: string, enabled: boolean) {
  const [data, setData] = useState<CommentListContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    if (!enabled || !reportId || !scriptId) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getScriptComments(reportId, scriptId);
        if (cancelled) return;

        if (response.success && response.content) {
          const comments = Array.isArray(response.content)
            ? response.content
            : [];
          setData({ comments });
        } else {
          throw new Error(response.message || '댓글을 불러오지 못했습니다.');
        }
      } catch (err: any) {
        if (cancelled) return;
        const msg = err?.response?.data?.message || err?.message || '댓글 로딩 중 오류가 발생했습니다.';
        setError(msg);
        showError(msg);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reportId, scriptId, enabled, refreshKey]);

  const refetch = () => setRefreshKey((k) => k + 1);

  const addComment = async (content: string) => {
    if (!reportId || !scriptId) return;
    if (!content || !content.trim()) return;
    try {
      setIsCreating(true);
      const response = await requestCreateComment(reportId, scriptId, content.trim());
      if (!response.success) {
        throw new Error(response.message || '댓글 등록에 실패했습니다.');
      }
      // 성공 시 목록 갱신
      refetch();
      showSuccess('댓글이 등록되었습니다.');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || '댓글 등록 중 오류가 발생했습니다.';
      showError(msg);
    } finally {
      setIsCreating(false);
    }
  };

  return { data, isLoading, error, refetch, addComment, isCreating };
}

export default useScriptComments;
