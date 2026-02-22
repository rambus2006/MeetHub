import { useState, useCallback } from 'react';
import { editReportDetail } from '../../api/reportService';
import type { ReportSummary } from '../../types/report';
import { useToastStore } from '../../store/useToastStore';

/**
 * 리포트 상세 정보(요약, 키워드)를 수정하는 API를 호출하는 커스텀 훅
 */
function useEditReport() {
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  const mutate = useCallback(
    async (reportId: string, updatedSummaryData: ReportSummary) => {
      setIsEditing(true);
      setError(null);

      try {
        const response = await editReportDetail(reportId, updatedSummaryData);

        if (response.success) {
          console.log('Report updated successfully:', response.content);
          addToast({ message: '수정이 완료되었습니다.' });
          return response.content;
        } else {
          throw new Error(response.message || '리포트 수정에 실패했습니다.');
        }
      } catch (err: any) {
        console.error('useEditReport Error:', err);
        setError(err.message);
        addToast({ type: 'error', message: `수정 실패: ${err.message}` });
      } finally {
        setIsEditing(false);
      }
    },
    [addToast]
  );

  return {
    editReport: mutate,
    isEditing,
    error,
  };
}

export default useEditReport;
