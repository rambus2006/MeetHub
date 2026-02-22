import { useEffect, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import '@livekit/components-styles';

import MeetingHeader from '../components/meeting/MeetingHeader';
import HostControlBar from '../components/meeting/HostControlBar';
import Sidebar from '../components/meeting/Sidebar';
import MeetingRoom from '../components/meeting/MeetingRoom';
import { useMeetingStore } from '../store/useMeetingStore';
import { useAuthStore } from '../store/useAuthStore';

function Meeting() {
  const [params] = useSearchParams();
  const roomId = params.get('roomId') || '';

  // 스토어에 생성 직후 받은 연결 정보가 있으면 우선 사용
  const storedServerUrl = useMeetingStore((s) => s.serverUrl);
  const storedToken = useMeetingStore((s) => s.token);

  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  /**
   * 호스트 여부 판단
   * (로그인할 때 userId 받아오게 되면 주석 해제 예정)
   */
  const myUserId = useAuthStore((s) => s.userId);
  const hostId = useMeetingStore((s) => s.hostId);
  const isHost = myUserId === hostId;

  // 자막 토글 상태
  const [captionsOn, setCaptionsOn] = useState(false);
  const onToggleCaptions = () => setCaptionsOn((prev) => !prev);

  // URL 접근 로직
  useEffect(() => {
    if (!roomId) return;
    // 스토어에 토큰/URL이 있으면 바로 사용
    if (storedServerUrl && storedToken) {
      setServerUrl(storedServerUrl);
      setToken(storedToken);
    }
  });

  const effectiveServerUrl = storedServerUrl || serverUrl;
  const effectiveToken = storedToken || token;
  const isReady = Boolean(effectiveServerUrl && effectiveToken);

  if (!roomId) return <Navigate to='/' replace />;

  if (!isReady) {
    return (
      <div className='relative flex h-screen flex-col overflow-hidden bg-gray-800'>
        <Sidebar />
        <div className='relative z-10 flex-shrink-0'>
          <MeetingHeader />
        </div>
        <div className='flex min-h-0 w-full flex-1 flex-row items-center justify-center gap-1 overflow-hidden px-20 pb-2 pr-20 pt-4'>
          <div className='flex h-full min-w-0 max-w-screen-xl flex-[4_1_0%] items-stretch rounded-lg bg-white shadow-lg'>
            <div className='m-auto text-gray-500'>화면 공유 대기중...</div>
          </div>
          <div className='flex h-full min-w-0 max-w-[420px] flex-[3_1_0%] flex-col gap-y-1'>
            <div className='flex min-h-0 flex-1'>
              <div className='m-auto text-white'>회의 연결 중...</div>
            </div>
          </div>
        </div>
        <div className='fixed bottom-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm'>
          <HostControlBar captionsOn={captionsOn} onToggleCaptions={onToggleCaptions} />
        </div>
      </div>
    );
  }

  return (
    <MeetingRoom
      serverUrl={effectiveServerUrl!}
      token={effectiveToken!}
      isHost={isHost}
    />
  );
}

export default Meeting;
