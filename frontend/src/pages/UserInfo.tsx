import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, ChevronLeft } from 'lucide-react';
import { profileEdit, changePassword } from '../api/authService';
// 훅 불러오기
import { fetchUserProfile } from '../hooks/auth/useProfile';
import { useToast } from '../hooks/common/useToast';
import { getErrorMessage } from '../hooks/auth/useErrorNotification';
import {
  validatePassword,
  validateConfirmPassword,
} from '../hooks/auth/useAuthValidation';
import { useWithdrawModal } from '../hooks/auth/useWithdrawModal';

const UserInfo = () => {
  const navigate = useNavigate();

  // 개별 상태 관리
  const [userName, setUserName] = useState<string>(''); //유저 이름 상태관리
  const [currentPassword, setCurrentPassword] = useState(''); // 현재 비밀번호 상태
  const [newPassword, setNewPassword] = useState(''); // 새로운 비밀번호 상태
  const [confirmPassword, setConfirmPassword] = useState(''); // 새로운 비밀번호 확인 상태

  // 에러 메시지 상태 관리
  const [currentPasswordError, setCurrentPasswordError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>('');

  // 탈퇴 모달 훅
  const {
    showWithdrawModal,
    openWithdrawModal,
    closeWithdrawModal,
    handleWithdraw,
  } = useWithdrawModal();

  // 토스트 사용
  const { showSuccess, showError } = useToast();

  // 초기에 유저 이름 미리 불러오는 함수 (로컬스토리지 최신화 포함)
  useEffect(() => {
    const init = async () => {
      try {
        const data = await fetchUserProfile();
        if (data?.name) setUserName(data.name);
      } catch (err) {
        showError('이름을 불러오는데 실패했습니다.');
      }
    };
    init();
  }, []);

  // 저장하기 버튼 후 발생함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 일치 확인
    const confirmErr = validateConfirmPassword(confirmPassword, newPassword);
    if (confirmErr) {
      setConfirmPasswordError(confirmErr);
      return;
    }

    // 새 비밀번호 유효성 검사
    if (newPassword) {
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        setPasswordError(passwordError);
        return;
      }
    }

    try {
      // 이름 변경 (입력된 경우에만)
      if (userName && userName.trim()) {
        await profileEdit(userName.trim());
      }

      // 비밀번호 변경 (모든 비밀번호 필드가 채워진 경우에만)
      if (currentPassword && newPassword && confirmPassword) {
        await changePassword(currentPassword, newPassword);
      }

      // 서버의 최신 프로필로 로컬스토리지 및 UI 동기화
      await fetchUserProfile();

      // 다른 컴포넌트에 프로필 업데이트 알림
      window.dispatchEvent(new CustomEvent('profileUpdated'));

      showSuccess('회원정보가 성공적으로 수정되었습니다.');

      // 폼 초기화
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordError('');
      setPasswordError('');
      setConfirmPasswordError('');

      // 홈화면으로 이동
      navigate('/');
    } catch (err: any) {
      // 현재 비밀번호 불일치 에러 처리
      const errorCode = err.response?.data?.errorCode || '';
      const errorMessage = err.response?.data?.message || '';

      if (
        errorCode === 'A002' ||
        errorMessage.includes('현재 비밀번호') ||
        errorMessage.includes('비밀번호가 올바르지 않습니다')
      ) {
        setCurrentPasswordError('현재 비밀번호가 올바르지 않습니다.');
        return;
      }

      // 다른 에러는 토스트로 표시
      const finalErrorMessage = getErrorMessage(err);
      showError(finalErrorMessage);
    }
  };
  // 탈퇴 로직은 useWithdrawModal 훅에서 처리
  // 화면 컴포넌트 시작
  return (
    <main className='grid min-h-screen w-full max-w-[100vw] place-items-center bg-white px-4 overflow-x-hidden overflow-y-hidden'>
      <section className='mx-4 my-0 w-full max-w-lg rounded-2xl border border-meethub-blue bg-white p-6'>
        {/* 헤더 */}
        <header className='mb-8'>
          <div className='relative mb-4 flex items-center justify-center'>
            <button
              onClick={() => navigate(-1)}
              className='absolute left-0 flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-200 hover:bg-gray-100'
              aria-label='뒤로가기'
            >
              <ChevronLeft className='h-6 w-6 text-meethub-blue' />
            </button>
            <h1 className='text-4xl font-extrabold italic tracking-tight text-meethub-blue'>
              MeetHub
            </h1>
          </div>
          <h2 className='text-center text-lg text-black'>회원정보 수정</h2>
        </header>

        {/* 폼 */}
        <div className='space-y-4 p-5'>
          <form onSubmit={handleSubmit} className='space-y-5'>
            {/* 이름 필드 */}
            <div>
              <label
                htmlFor='name'
                className='mb-2 block text-sm font-medium text-black'
              >
                이름
              </label>
              <div className='relative'>
                <User className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-black' />
                <input
                  type='text'
                  id='name'
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder='멋진 새 이름을 입력해보세요.'
                  className='w-full rounded border border-black bg-white py-2.5 pl-12 pr-4 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300'
                />
              </div>
            </div>

            {/* 현재 비밀번호 */}
            <div>
              <label
                htmlFor='currentPassword'
                className='mb-2 block text-sm font-medium text-black'
              >
                현재 비밀번호
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-black' />
                <input
                  type='password'
                  id='currentPassword'
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    // 현재 비밀번호 입력 시 에러 메시지 초기화
                    setCurrentPasswordError('');
                  }}
                  placeholder='현재 비밀번호를 입력하세요'
                  className='w-full rounded border border-black bg-white py-2.5 pl-12 pr-4 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300'
                />
              </div>
              {currentPasswordError && (
                <p className='mt-1 text-xs text-red-500'>
                  {currentPasswordError}
                </p>
              )}
            </div>

            {/* 새 비밀번호 */}
            <div>
              <label
                htmlFor='newPassword'
                className='mb-2 block text-sm font-medium text-black'
              >
                새 비밀번호
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-black' />
                <input
                  type='password'
                  id='newPassword'
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    // 실시간 검증
                    if (e.target.value) {
                      const error = validatePassword(e.target.value);
                      setPasswordError(error || '');
                    } else {
                      setPasswordError('');
                    }
                    // 새 비밀번호가 변경되면 확인 비밀번호도 다시 검증
                    if (confirmPassword) {
                      const confirmErr = validateConfirmPassword(
                        confirmPassword,
                        e.target.value
                      );
                      setConfirmPasswordError(confirmErr || '');
                    }
                  }}
                  placeholder='새 비밀번호'
                  className='w-full rounded border border-black bg-white py-2.5 pl-12 pr-4 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300'
                />
              </div>
              {passwordError && (
                <p className='mt-1 text-xs text-red-500'>{passwordError}</p>
              )}
            </div>

            {/* 새 비밀번호 확인 */}
            <div>
              <label
                htmlFor='confirmPassword'
                className='mb-2 block text-sm font-medium text-black'
              >
                새 비밀번호 확인
              </label>
              <div className='relative'>
                <Lock className='absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 transform text-black' />
                <input
                  type='password'
                  id='confirmPassword'
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    // 실시간 검증
                    if (e.target.value) {
                      const confirmErr = validateConfirmPassword(
                        e.target.value,
                        newPassword
                      );
                      setConfirmPasswordError(confirmErr || '');
                    } else {
                      setConfirmPasswordError('');
                    }
                  }}
                  placeholder='새 비밀번호 확인'
                  className='w-full rounded border border-black bg-white py-2.5 pl-12 pr-4 text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300'
                />
              </div>
              {confirmPasswordError && (
                <p className='mt-1 text-xs text-red-500'>
                  {confirmPasswordError}
                </p>
              )}
            </div>

            {/* 저장 버튼 */}
             <div className='pt-3'>
              <button
                type='submit'
                 className='w-full rounded-md bg-meethub-blue px-6 py-2.5 font-medium text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-opacity-50'
              >
                저장하기
              </button>

              {/* 탈퇴하기 링크 */}
               <div className='mt-3 text-center'>
                <button
                  type='button'
                  onClick={openWithdrawModal}
                  className='text-sm text-red-500 underline transition-colors duration-200 hover:text-red-700'
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* 탈퇴 확인 모달 */}
      {showWithdrawModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
          <section className='m-6 w-full max-w-md rounded-2xl border border-meethub-blue bg-white p-8'>
            <div className='text-center'>
              <h3 className='mb-4 text-lg font-bold text-black'>회원탈퇴</h3>
              <p className='mb-6 text-gray-600'>
                정말로 탈퇴하시겠습니까?
                <br />
                탈퇴 후에는 복구할 수 없습니다.
              </p>
              <div className='flex space-x-3'>
                <button
                  onClick={closeWithdrawModal}
                  className='flex-1 rounded-md bg-gray-300 px-6 py-3 font-medium text-black shadow-md transition-colors duration-200 hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50'
                >
                  취소
                </button>
                <button
                  onClick={handleWithdraw}
                  className='flex-1 rounded-md bg-red-500 px-6 py-3 font-medium text-white shadow-md transition-colors duration-200 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-opacity-50'
                >
                  탈퇴하기
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default UserInfo;
