// src/hooks/report/useDeleteReport.ts

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteReport } from '../../api/reportService';
import { useToastStore } from '../../store/useToastStore';

/**
 * 리포트 삭제 API를 호출하고 관련 상태를 관리하는 커스텀 훅
 */
function useDeleteReport() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addToast = useToastStore((state) => state.addToast);
  const navigate = useNavigate();

  const mutate = useCallback(
    async (reportId: string, options?: { skipConfirm?: boolean }) => {
      if (!options?.skipConfirm) {
        if (!window.confirm('정말로 이 리포트를 삭제하시겠습니까?')) {
          return false;
        }
      }

      setIsDeleting(true);
      setError(null);

      try {
        const response = await deleteReport(reportId);

        if (response.success) {
          addToast({ message: '리포트가 성공적으로 삭제되었습니다.' });
          navigate('/');
          return true;
        } else {
          throw new Error(response.message || '리포트 삭제에 실패했습니다.');
        }
      } catch (err: any) {
        console.error('useDeleteReport Error:', err);
        setError(err.message);
        addToast({ type: 'error', message: `삭제 실패: ${err.message}` });
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [addToast, navigate]
  );

  return {
    deleteReport: mutate,
    isDeleting,
    error,
  };
}

export default useDeleteReport;
