import {
  ParticipantTile,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { isLiveVideo } from '../../utils/livekitUtils';

function CameraTilesPrimary() {
  const room = useRoomContext();
  if (!room) return null;

  const cameraRefs = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);

  const liveCams = cameraRefs.filter(isLiveVideo);

  if (liveCams.length === 0) {
    return null;
  }

  const first = liveCams[0];
  return (
    <div className='aspect-[4/3] w-full'>
      <div className='h-full w-full'>
        <ParticipantTile trackRef={first} />
      </div>
    </div>
  );
}

export default CameraTilesPrimary;
