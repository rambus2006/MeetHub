import '../../styles/livekit-stage.css';
import { ParticipantTile, useTracks } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useMemo } from 'react';
import { isLiveVideo } from '../../utils/livekitUtils';

export default function StageLayout({
  sidebarPx = 88,
}: {
  sidebarPx?: number;
}) {
  const screenRefs = useTracks([
    { source: Track.Source.ScreenShare, withPlaceholder: false },
  ]);
  const camRefs = useTracks([
    { source: Track.Source.Camera, withPlaceholder: false },
  ]);

  // 화면공유 1개, 카메라 앞에서 2개까지만 픽
  const screenRef = useMemo(() => screenRefs.find(isLiveVideo), [screenRefs]);
  const camReal = useMemo(
    () => camRefs.filter(isLiveVideo).slice(0, 2),
    [camRefs]
  );
  const cam1 = camReal[0];
  const cam2 = camReal[1];

  // 레이아웃 정의
  let layoutMode:
    | 'share-only'
    | 'share-1cam'
    | 'share-2cam'
    | 'cam-1'
    | 'cam-2plus'
    | 'idle';

  const hasScreen = !!screenRef;
  const camCount = (cam1 ? 1 : 0) + (cam2 ? 1 : 0);

  if (hasScreen) {
    if (camCount === 0) layoutMode = 'share-only';
    else if (camCount === 1) layoutMode = 'share-1cam';
    else layoutMode = 'share-2cam';
  } else {
    if (camCount === 1) layoutMode = 'cam-1';
    else if (camCount >= 2) layoutMode = 'cam-2plus';
    else layoutMode = 'idle';
  }

  return (
    <div
      className={`stage-shell ${layoutMode}`}
      style={{ paddingRight: `${sidebarPx}px` }}
    >
      {/* 좌측: 화면공유 영역 */}
      <div className='area-share tile'>
        {screenRef ? (
          <ParticipantTile
            key={`${screenRef.participant.identity}-${screenRef.publication?.trackSid ?? 'scr'}`}
            trackRef={screenRef}
            className='fill'
          />
        ) : (
          <div className='empty fill grid flex-shrink flex-grow place-items-center'>
            {layoutMode === 'idle' ? (
              <div className='w-full text-center text-xl font-semibold text-gray-400'>
                                공유된 화면이 없습니다.            
              </div>
            ) : null}
          </div>
        )}
      </div>
      {/* 우측 상단: 카메라1 */}
      {cam1 && !cam1.publication?.isMuted && (
        <div className='area-cam1 tile'>
          <ParticipantTile
            key={`${cam1.participant.identity}-${cam1.publication?.trackSid ?? 'cam1'}`}
            trackRef={cam1}
            className='fill'
          />
        </div>
      )}

      {/* 우측 하단: 카메라2 */}
      {cam2 && (
        <div className='area-cam2 tile'>
          <ParticipantTile
            key={`${cam2.participant.identity}-${cam2.publication?.trackSid ?? 'cam2'}`}
            trackRef={cam2}
            className='fill'
          />
        </div>
      )}
    </div>
  );
}
