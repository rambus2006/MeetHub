import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import MeetingHeader from './MeetingHeader';
import HostControlBar from './HostControlBar';
import ParticipantControlBar from './ParticipantControlBar';
import Sidebar from './Sidebar';
import StageLayout from './StageLayout';
import CaptionsOverlay from '../captions/CaptionsOverlay';
import { useCaptionsState } from '../../hooks/useCaptions';

export interface MeetingRoomProps {
  serverUrl: string;
  token: string;
  isHost: boolean;
}

const MeetingRoom = ({ serverUrl, token, isHost }: MeetingRoomProps) => {
  const { enabled: captionsOn, toggle: toggleCaptions } = useCaptionsState(false);
  return (
    <LiveKitRoom
      serverUrl={serverUrl!}
      token={token!}
      connect
      audio
      video={false}
      options={{
        adaptiveStream: true,
        dynacast: true,
        stopLocalTrackOnUnpublish: false,
      }}
    >
      <div className='relative flex h-screen flex-col bg-gray-800'>
        <Sidebar />
        <div className='relative z-10 flex-shrink-0'>
          <MeetingHeader />
        </div>

        <div className='flex min-h-0 w-full flex-1'>
          <StageLayout sidebarPx={88} />
        </div>

		{/* 실시간 자막 표시 */}
		{captionsOn ? <CaptionsOverlay text={'자막 데모 문장입니다.'} /> : null}

		<div className='relative z-0 flex-shrink-0'>
			{isHost ? (
				<HostControlBar captionsOn={captionsOn} onToggleCaptions={toggleCaptions} />
			) : (
				<ParticipantControlBar captionsOn={captionsOn} onToggleCaptions={toggleCaptions} />
			)}
        </div>
        <RoomAudioRenderer />
      </div>
    </LiveKitRoom>
  );
};

export default MeetingRoom;
