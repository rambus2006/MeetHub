import { useRef, useEffect } from 'react'; // useState 제거

interface ReportVideoProps {
  videoUrl: string;
  title: string;
  jumpTime: number | null;
  onTimeUpdate?: (currentTimeSec: number) => void;
}

function ReportVideo({
  videoUrl,
  title,
  jumpTime,
  onTimeUpdate,
}: ReportVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastEmitRef = useRef<number>(0);

  useEffect(() => {
    if (jumpTime !== null && videoRef.current) {
      videoRef.current.currentTime = jumpTime;
    }
  }, [jumpTime]);

  return (
    <div
      className='relative w-full overflow-hidden rounded-lg bg-gray-900 shadow-lg'
      style={{ aspectRatio: '16/9' }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        title={title}
        controls
        className='h-full w-full'
        onTimeUpdate={() => {
          if (!onTimeUpdate || !videoRef.current) return;
          const now = Date.now();
          // 100ms(1초) 단위 갱신
          if (now - lastEmitRef.current < 100) return;
          lastEmitRef.current = now;
          onTimeUpdate(videoRef.current.currentTime);
        }}
      >
        영상을 지원하지 않는 브라우저입니다.
      </video>
    </div>
  );
}

export default ReportVideo;
