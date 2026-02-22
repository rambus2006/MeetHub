import { useState, useEffect } from 'react';
import { getReportDetail } from '../../api/reportService';
import type { ReportDetailContent } from '../../types/report';

function useReportDetail(reportId: string | undefined) {
  const [data, setData] = useState<ReportDetailContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reportId) {
      setError('미팅 ID가 유효하지 않습니다.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setData(null);

      try {
        const response = await getReportDetail(reportId);

        if (response.success && response.content) {
          setData(response.content);
        } else {
          throw new Error(
            response.message || '리포트 상세 정보를 불러오는 데 실패했습니다.'
          );
        }
      } catch (err: any) {
        console.error('useReportDetail Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [reportId]);

  return { data, isLoading, error };
}

export default useReportDetail;
