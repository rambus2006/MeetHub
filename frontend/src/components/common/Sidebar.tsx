import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignOut } from '../../hooks/auth/useSignOut';
import StartMeetingModal from '../home/StartMeetingModal';
import EnterMeetingModal from '../home/EnterMeetingModal';
import type { SidebarProps } from '../../types/sidebar';

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();
  const { handleSignOut } = useSignOut();

  // 회의 생성 모달 관리
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사용자 이름 표시를 위한 상태 및 동기화
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const raw = localStorage.getItem('user');
        if (!raw) {
          setUserName('');
          return;
        }
        const parsed = JSON.parse(raw) as { name?: string };
        setUserName(parsed?.name ?? '');
      } catch {
        setUserName('');
      }
    };

    loadUserFromStorage();
    const handler = () => loadUserFromStorage();
    window.addEventListener('profileUpdated', handler as EventListener);
    return () =>
      window.removeEventListener('profileUpdated', handler as EventListener);
  }, []);

  const handleOpenStartModal = () => setIsStartModalOpen(true);
  const handleCloseStartModal = () => {
    setIsStartModalOpen(false);
    setIsSubmitting(false);
  };
  const handleStartMeetingSubmit = async () => {
    setIsSubmitting(true);
  };

  // 회의 입장 모달 관리
  const [isEnterModalOpen, setIsEnterModalOpen] = useState(false);
  const [isEnterSubmitting, setIsEnterSubmitting] = useState(false);

  const handleOpenEnterModal = () => setIsEnterModalOpen(true);
  const handleCloseEnterModal = () => setIsEnterModalOpen(false);
  const handleEnterMeetingSubmit = async () => {
    setIsEnterSubmitting(true);
    try {
      setIsEnterModalOpen(false);
    } finally {
      setIsEnterSubmitting(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div
          className='fixed inset-0 z-10 bg-black/50 lg:hidden'
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed left-0 top-16 z-20 flex h-[calc(100vh-4rem)] w-60 flex-shrink-0 flex-col border-r border-gray-300 bg-white transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:h-full lg:translate-x-0`}
      >
        <div className='flex-1 overflow-y-auto p-4'>
          <div>
            <p
              className={`mb-4 text-center text-lg font-bold ${
                isOpen ? 'block' : 'hidden'
              } lg:block`}
            >
              {userName ? `${userName} 님 환영합니다` : '환영합니다'}
            </p>

            <button
              onClick={handleOpenStartModal}
              className={`${
                isOpen ? 'block' : 'hidden'
              } h-10 w-full rounded bg-black font-medium text-white transition-colors hover:bg-gray-800 lg:block`}
            >
              회의시작하기
            </button>
            <button
              onClick={handleOpenEnterModal}
              className={`${
                isOpen ? 'block' : 'hidden'
              } my-4 h-10 w-full rounded bg-black font-medium text-white transition-colors hover:bg-gray-800 lg:block`}
            >
              회의입장하기
            </button>
          </div>
        </div>

        <div className='space-y-2 border-t border-gray-300 p-4 text-sm'>
          <button
            onClick={() => {
              navigate('/userinfo');
              onClose();
            }}
            className={`flex w-full items-center justify-start rounded p-2 text-left hover:bg-gray-50`}
          >
            <span className={`${isOpen ? 'inline' : 'hidden'} lg:inline`}>
              회원정보 수정
            </span>
          </button>

          <button
            onClick={handleSignOut}
            className={`flex w-full items-center justify-start rounded p-2 text-left hover:bg-gray-50`}
          >
            <span className={`${isOpen ? 'inline' : 'hidden'} lg:inline`}>
              로그아웃
            </span>
          </button>
        </div>
      </aside>

      <EnterMeetingModal
        isOpen={isEnterModalOpen}
        onClose={handleCloseEnterModal}
        onSubmit={handleEnterMeetingSubmit}
        isSubmitting={isEnterSubmitting}
      />
      <StartMeetingModal
        isOpen={isStartModalOpen}
        onClose={handleCloseStartModal}
        onSubmit={handleStartMeetingSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}

export default Sidebar;
