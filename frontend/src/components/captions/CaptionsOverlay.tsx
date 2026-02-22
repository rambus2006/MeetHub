export interface CaptionsOverlayProps {
  text?: string;
  className?: string;
}

export default function CaptionsOverlay({
  text = '',
  className,
}: CaptionsOverlayProps) {
  if (!text) return null;

  return (
    <div
      className={`pointer-events-none absolute bottom-20 left-0 right-0 z-30 flex w-full justify-center pb-3 ${
        className ?? ''
      }`}
    >
      <div className='w-[92%] max-w-4xl rounded-xl bg-black/60 px-4 py-2 text-white shadow-lg backdrop-blur-sm'>
        <div className='text-xl opacity-95'>{text}</div>
      </div>
    </div>
  );
}
