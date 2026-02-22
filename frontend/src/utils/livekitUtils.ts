import type {
  TrackReference,
  TrackReferenceOrPlaceholder,
} from '@livekit/components-react';

// "트랙이 실제로 붙어있는" ref만 true
export const isLiveVideo = (
  r?: TrackReferenceOrPlaceholder
): r is TrackReference => !!r?.publication?.track && !r.publication.isMuted;
