import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useRoomContext, useDisconnectButton } from '@livekit/components-react';

import MeetingShareModal from './MeetingShareModal';

import { useMeetingStore } from '../../store/useMeetingStore';

import { Mic, MicOff, Upload, X, ClosedCaption } from 'lucide-react';

interface ParticipantControlBarProps {
  captionsOn: boolean;
  onToggleCaptions: () => void;
}

function ParticipantControlBar({ captionsOn, onToggleCaptions }: ParticipantControlBarProps) {
  const room = useRoomContext();
  //사용자 마이크 상태관리
  const [isMuted, setIsMuted] = useState(false);
  // 공유 모달창 상태관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const storedRoomId = useMeetingStore((s) => s.roomId);

  // 초기 상태 동기화
  useEffect(() => {
    if (!room) return;
    const lp = room.localParticipant;
    setIsMuted(!lp.isMicrophoneEnabled);
  }, [room]);

  const handleMuteToggle = async () => {
    if (!room) return;
    const next = !room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setIsMuted(!next);
  };

  const { buttonProps: rawButtonProps } = useDisconnectButton({
    stopTracks: true,
  });

  const {
    onClick: livekitOnClick,
    stopTracks,
    ...disconnectProps
  } = rawButtonProps;

  const clear = useMeetingStore((s) => s.clear);

  const handleClick = async () => {
    await livekitOnClick?.();
    clear();
    navigate('/');
  };

  return (
    <div className='h-16 bg-black px-3 py-3 md:h-auto md:px-6'>
      <div className='mx-auto flex h-full max-w-6xl items-center'>
        <div className='flex w-full items-center justify-between gap-2'>
          <div className='flex flex-1 items-center justify-center space-x-1 overflow-x-auto md:space-x-4'>
            <button
              onClick={onToggleCaptions}
              aria-pressed={captionsOn}
              className={`flex h-9 w-9 items-center justify-center rounded-full border border-gray-600 transition-colors md:h-10 md:w-10 ${
                captionsOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <ClosedCaption className='h-4 w-4 flex-shrink-0 text-white md:h-5 md:w-5' />
            </button>
            {/* 마이크 버튼 */}
            <button
              onClick={handleMuteToggle}
              className='flex h-9 w-9 flex-shrink-0 items-center space-x-1 rounded-full border border-gray-600 bg-gray-800 px-3 py-2 transition-colors hover:bg-gray-700 md:h-10 md:w-auto md:space-x-2 md:px-4'
              disabled={!room}
            >
              {!isMuted ? (
                <MicOff className='h-4 w-4 text-white md:h-5 md:w-5' />
              ) : (
                <Mic className='h-4 w-4 text-white md:h-5 md:w-5' />
              )}
              <span className='hidden text-sm font-medium text-white md:inline'>
                {!isMuted ? '음소거 해제' : '음소거'}
              </span>
            </button>

            {/* id 공유 버튼 */}
            <button
              className='flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gray-600 bg-gray-800 transition-colors hover:bg-gray-700 md:h-10 md:w-10'
              onClick={() => setIsModalOpen(true)}
            >
              <Upload className='h-4 w-4 flex-shrink-0 text-white md:h-5 md:w-5' />
            </button>
            <MeetingShareModal
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              urlToShare={
                storedRoomId || '방 아이디가 없습니다. 새로고침해주세요.'
              }
            />
            {/* 회의 화면 종료 버튼*/}
            <button
              {...disconnectProps}
              onClick={handleClick}
              className='flex h-9 w-9 items-center justify-center rounded-full bg-red-600 transition-colors hover:bg-red-700 md:h-10 md:w-10'
            >
              <X className='h-4 w-4 flex-shrink-0 text-white md:h-5 md:w-5' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParticipantControlBar;
