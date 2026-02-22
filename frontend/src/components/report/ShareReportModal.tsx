import { useEffect, useState } from 'react';
import { validateEmail } from '../../hooks/auth/useAuthValidation';
import { useShareReport } from '../../hooks/report/useShareReport';

interface ShareReportModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (payload: {
    email: string;
    permission: 'VIEWER' | 'EDITOR';
  }) => void;
  submitting?: boolean;
  reportId?: string;
}

const ShareReportModal = ({
  open,
  onClose,
  onSubmit,
  submitting,
  reportId,
}: ShareReportModalProps) => {
  const [activeTab, setActiveTab] = useState<'grant' | 'list'>('grant');
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'VIEWER' | 'EDITOR'>('VIEWER');
  const emailError = validateEmail(email);

  const {
    permissions,
    isLoadingPermissions,
    permissionsError,
    fetchPermissions,
  } = useShareReport();

  useEffect(() => {
    if (open && activeTab === 'list' && reportId) {
      fetchPermissions(reportId);
    }
  }, [open, activeTab, reportId]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/30' onClick={onClose} />

      <div className='relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl'>
        <h3 className='text-lg font-semibold'>회의록 공유</h3>

        <div className='mt-4 border-b'>
          <nav className='-mb-px flex gap-4'>
            <button
              className={`px-3 pb-2 text-sm ${
                activeTab === 'grant'
                  ? 'border-b-2 border-blue-600 font-medium text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('grant')}
            >
              권한 부여
            </button>
            <button
              className={`px-3 pb-2 text-sm ${
                activeTab === 'list'
                  ? 'border-b-2 border-blue-600 font-medium text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('list')}
            >
              권한 조회
            </button>
          </nav>
        </div>

        {activeTab === 'grant' && (
          <>
            <p className='mt-3 text-sm text-gray-500'>
              공유할 사용자의 이메일과 권한을 선택하세요.
            </p>
            <div className='mt-4 space-y-4'>
              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  이메일
                </label>
                <input
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='user@example.com'
                  className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus:border-blue-600 ${
                    emailError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={submitting}
                />
                {emailError && (
                  <p className='mt-1 text-xs text-red-600'>{emailError}</p>
                )}
              </div>

              <div>
                <label className='mb-1 block text-sm font-medium text-gray-700'>
                  권한
                </label>
                <div className='flex gap-3'>
                  <label className='inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm'>
                    <input
                      type='radio'
                      name='permission'
                      value='VIEWER'
                      checked={permission === 'VIEWER'}
                      onChange={() => setPermission('VIEWER')}
                      disabled={submitting}
                    />
                    <span>Viewer (조회만)</span>
                  </label>
                  <label className='inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm'>
                    <input
                      type='radio'
                      name='permission'
                      value='EDITOR'
                      checked={permission === 'EDITOR'}
                      onChange={() => setPermission('EDITOR')}
                      disabled={submitting}
                    />
                    <span>Editor (편집가능)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className='mt-6 flex justify-end gap-2'>
              <button
                onClick={onClose}
                className='rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                disabled={submitting}
              >
                취소
              </button>
              <button
                onClick={() => {
                  onSubmit?.({ email, permission });
                }}
                className='rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-white disabled:hover:bg-gray-300'
                disabled={!email || !!emailError || submitting}
              >
                {submitting ? '공유 중...' : '공유'}
              </button>
            </div>
          </>
        )}

        {activeTab === 'list' && (
          <div className='mt-4'>
            <div className='rounded-md border border-gray-200'>
              <div className='border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-700'>
                권한 목록
              </div>
              {isLoadingPermissions ? (
                <div className='p-6 text-center text-sm text-gray-500'>
                  불러오는 중...
                </div>
              ) : permissionsError ? (
                <div className='p-6 text-center text-sm text-red-600'>
                  {permissionsError}
                </div>
              ) : permissions.length === 0 ? (
                <div className='p-6 text-center text-sm text-gray-500'>
                  권한 목록이 없습니다.
                </div>
              ) : (
                <ul className='divide-y divide-gray-100'>
                  {permissions.map((p) => (
                    <li
                      key={p.id}
                      className='flex items-center justify-between px-4 py-3'
                    >
                      <div className='flex items-center gap-3'>
                        <div>
                          <div className='text-sm font-medium text-gray-800'>
                            {p.userName ?? '사용자'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                          (p.permission ?? '').toUpperCase() === 'EDITOR'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {(p.permission ?? '').toUpperCase()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className='mt-4 flex justify-end'>
              <button
                onClick={onClose}
                className='rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareReportModal;
