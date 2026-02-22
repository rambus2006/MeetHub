import {
  ParticipantTile,
  type TrackReference,
} from '@livekit/components-react';

export interface PresentationSlideProps {
  trackRef?: TrackReference;
}

function PresentationSlide({ trackRef }: PresentationSlideProps) {
  if (!trackRef) {
    return (
      <div className='grid place-items-center overflow-auto rounded-lg bg-white p-4 text-gray-500 md:p-8'>
        화면 공유 데이터를 불러오는 중...
      </div>
    );
  }

  return (
    <div className='aspect-video w-full'>
      <div className='lk-share-fit h-full w-full'>
        <ParticipantTile trackRef={trackRef} />
      </div>
    </div>
  );
}

export default PresentationSlide;
