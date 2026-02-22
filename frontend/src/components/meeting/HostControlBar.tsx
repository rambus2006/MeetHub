import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomContext, useDisconnectButton } from '@livekit/components-react';
import MeetingShareModal from './MeetingShareModal';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  CircleSmall,
  Upload,
  Square,
  X,
  ClosedCaption,
  ScreenShare,
  ScreenShareOff,
} from 'lucide-react';

import { useMeetingStore } from '../../store/useMeetingStore';

interface HostControlBarProps {
  captionsOn: boolean;
  onToggleCaptions: () => void;
}

function HostControlBar({ captionsOn, onToggleCaptions }: HostControlBarProps) {
  const room = useRoomContext();
  //사용자 마이크 상태관리
  const [isMuted, setIsMuted] = useState(false);
  // 사용자 웹캠 상태관리
  const [isVideoOn, setIsVideoOn] = useState(false);
  // 화면 녹화 상태관리
  const [isRecordOn, setIsRecordOn] = useState(false);
  // 화면공유 상태관리
  const [isScreenOn, setIsScreenOn] = useState(false);
  // 공유 모달창 상태관리
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 초기 상태 동기화
  useEffect(() => {
    if (!room) return;
    const lp = room.localParticipant;
    setIsMuted(!lp.isMicrophoneEnabled);
    setIsVideoOn(lp.isCameraEnabled);
    setIsScreenOn(lp.isScreenShareEnabled);
  }, [room]);

  const handleMuteToggle = async () => {
    if (!room) return;
    const next = !room.localParticipant.isMicrophoneEnabled;
    await room.localParticipant.setMicrophoneEnabled(next);
    setIsMuted(!next);
  };

  const handleVideoToggle = async () => {
    if (!room) return;
    const next = !room.localParticipant.isCameraEnabled;
    await room.localParticipant.setCameraEnabled(next);
    setIsVideoOn(next);
  };

  const handleRecordToggle = () => {
    setIsRecordOn(!isRecordOn);
  };

  const handleScreenToggle = async () => {
    if (!room) return;
    const next = !room.localParticipant.isScreenShareEnabled;
    await room.localParticipant.setScreenShareEnabled(next);
    setIsScreenOn(next);
  };

  // 공유할 room id 스토에서 꺼내오기
  const storedRoomId = useMeetingStore((s) => s.roomId);

  // 연결 종료를 위한 훅 호출
  const { buttonProps: rawButtonProps } = useDisconnectButton({
    stopTracks: true,
  });

  const {
    onClick: livekitOnClick,
    stopTracks,
    ...disconnectProps
  } = rawButtonProps;

  const navigate = useNavigate();
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
              className={`borderbg-gray-800 flex h-9 w-9 items-center justify-center rounded-full border-gray-600 transition-colors md:h-10 md:w-10 ${
                captionsOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <ClosedCaption className='h-4 w-4 flex-shrink-0 text-white md:h-5 md:w-5' />
            </button>
            {/* 마이크 버튼 */}
            <button
              onClick={handleMuteToggle}
              className='bg-gray-800px-3 flex h-9 w-9 flex-shrink-0 items-center space-x-1 rounded-full border border-gray-600 bg-gray-800 py-2 transition-colors hover:bg-gray-700 md:h-10 md:w-auto md:space-x-2 md:px-4'
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

            {/* 비디오 버튼 */}
            <button
              onClick={handleVideoToggle}
              className='flex h-9 w-9 flex-shrink-0 items-center space-x-1 rounded-full border border-gray-600 bg-gray-800 px-3 py-2 transition-colors hover:bg-gray-700 md:h-10 md:w-auto md:space-x-2 md:px-4'
              disabled={!room}
            >
              {isVideoOn ? (
                <Video className='h-4 w-4 text-white md:h-5 md:w-5' />
              ) : (
                <VideoOff className='h-4 w-4 text-white md:h-5 md:w-5' />
              )}
              <span className='hidden text-sm font-medium text-white md:inline'>
                {isVideoOn ? '비디오 중지' : '비디오 시작'}
              </span>
            </button>

            {/* 화면 공유 버튼 */}
            <button
              onClick={handleScreenToggle}
              className='flex h-9 w-9 flex-shrink-0 items-center space-x-1 rounded-full border border-gray-600 bg-gray-800 px-3 py-2 transition-colors hover:bg-gray-700 md:h-10 md:w-auto md:space-x-2 md:px-4'
              disabled={!room}
            >
              {isScreenOn ? (
                <ScreenShare className='h-4 w-4 text-white md:h-5 md:w-5' />
              ) : (
                <ScreenShareOff className='h-4 w-4 text-white md:h-5 md:w-5' />
              )}
              <span className='hidden text-sm font-medium text-white md:inline'>
                {isScreenOn ? '화면공유 중지' : '화면공유 시작'}
              </span>
            </button>

            {/* 녹화버튼 */}
            <button
              onClick={handleRecordToggle}
              className='flex h-9 w-9 flex-shrink-0 items-center space-x-1 rounded-full border border-gray-600 bg-gray-800 px-3 py-2 transition-colors hover:bg-gray-700 md:h-10 md:w-auto md:space-x-2 md:px-4'
            >
              {isRecordOn ? (
                <Square className='h-4 w-4 text-white md:h-5 md:w-5' />
              ) : (
                <CircleSmall className='h-4 w-4 text-white md:h-5 md:w-5' />
              )}
              <span className='hidden text-sm font-medium text-white md:inline'>
                {isRecordOn ? '녹화 중지' : '녹화 시작'}
              </span>
            </button>

            {/* Room Id 공유 버튼*/}
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

export default HostControlBar;
