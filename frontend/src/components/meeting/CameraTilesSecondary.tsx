import {
  ParticipantTile,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';

function CameraTilesSecondary() {
  const room = useRoomContext();
  if (!room) return null;

  const cameraTracks =
    useTracks([{ source: Track.Source.Camera, withPlaceholder: false }]) || [];

  if (cameraTracks.length <= 1) {
    return (
      <div className='grid aspect-[4/3] w-full place-items-center rounded-lg bg-white shadow-lg'>
        <div className='m-auto text-gray-400'>카메라 없음</div>
      </div>
    );
  }

  const second = cameraTracks[1];
  return (
    <div className='aspect-[4/3] w-full'>
      <div className='h-full w-full'>
        <ParticipantTile trackRef={second} />
      </div>
    </div>
  );
}

export default CameraTilesSecondary;
