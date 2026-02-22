import { useState, useEffect } from 'react';
import useEditReport from '../../hooks/report/useEditReport';

interface ReportAnalysisProps {
  reportId: string;
  initialKeywords: string[];
  initialSummary: string;
}

function ReportAnalysis({
  reportId,
  initialKeywords,
  initialSummary,
}: ReportAnalysisProps) {
  const { editReport, error } = useEditReport();

  // 요약 수정 상태
  const [isSummaryEditing, setIsSummaryEditing] = useState(false);
  const [summary, setSummary] = useState(initialSummary);

  const [isKeywordEditing, setIsKeywordEditing] = useState(false);
  const [keywords, setKeywords] = useState(initialKeywords.join(', '));

  // 부모에서 변경되면 여기서도 변경
  useEffect(() => {
    setSummary(initialSummary);
  }, [initialSummary]);

  useEffect(() => {
    setKeywords(initialKeywords.join(', '));
  }, [initialKeywords]);

  // 요약 저장 핸들러
  const handleSummarySave = async () => {
    await editReport(reportId, {
      content: summary,
      keyword: keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    });
    if (!error) {
      setIsSummaryEditing(false);
    }
  };

  // 요약 취소 핸들러
  const handleSummaryCancel = () => {
    setIsSummaryEditing(false);
    setSummary(initialSummary);
  };

  // 키워드 저장 핸들러
  const handleKeywordSave = async () => {
    await editReport(reportId, {
      content: summary,
      keyword: keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean),
    });
    if (!error) {
      setIsKeywordEditing(false);
    }
  };

  // 키워드 취소 핸들러
  const handleKeywordCancel = () => {
    setIsKeywordEditing(false);
    setKeywords(initialKeywords.join(', '));
  };

  return (
    <div className='space-y-6 lg:col-span-1'>
      {/* --- 키워드 섹션 --- */}
      <div className='mb-2 flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>키워드</h2>
        {isKeywordEditing ? (
          <div>
            <button
              onClick={handleKeywordSave}
              className='text-sm font-medium text-blue-600'
            >
              저장
            </button>
            <button
              onClick={handleKeywordCancel}
              className='ml-2 text-sm text-gray-600'
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsKeywordEditing(true)}
            className='text-sm font-medium text-blue-600'
          >
            수정
          </button>
        )}
      </div>

      {isKeywordEditing ? (
        <input
          type='text'
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          className='w-full rounded border border-gray-300 p-2 text-sm'
          placeholder='콤마(,)로 키워드 구분'
        />
      ) : (
        <div className='flex flex-wrap gap-2'>
          {keywords.split(',').map((k, i) => (
            <span
              key={i}
              className='rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800'
            >
              {k}
            </span>
          ))}
        </div>
      )}

      {/* --- 요약 섹션 --- */}
      <div className='mb-2 flex items-center justify-between'>
        <h2 className='text-2xl font-semibold'>요약</h2>
        {isSummaryEditing ? (
          <div>
            <button
              onClick={handleSummarySave}
              className='text-sm font-medium text-blue-600'
            >
              저장
            </button>
            <button
              onClick={handleSummaryCancel}
              className='ml-2 text-sm text-gray-600'
            >
              취소
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsSummaryEditing(true)}
            className='text-sm font-medium text-blue-600'
          >
            수정
          </button>
        )}
      </div>

      {isSummaryEditing ? (
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className='h-40 w-full rounded border border-gray-300 p-2 text-sm leading-relaxed text-gray-700'
        />
      ) : (
        <p className='text-sm leading-relaxed text-gray-700'>{summary}</p>
      )}
    </div>
  );
}

export default ReportAnalysis;
