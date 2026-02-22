import { useParticipants } from '@livekit/components-react';

import { useEffect } from 'react';

import { Mic, MicOff, Video, VideoOff } from 'lucide-react';

const ParticipantsPanel = () => {
  const participants = useParticipants();

  useEffect(() => {
    console.log(participants);
  }, []);

  // 발표자(identity가 1인 참여자 = 가장 먼저 들어온 참여자)
  const host = participants.find((p) => p.identity === '1');

  return (
    <div className='flex-1 space-y-4 overflow-y-auto'>
      <div>
        <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-white'>
          <div className='h-4 w-1 rounded-full bg-blue-500'></div>
          발표자
        </div>

        <div className='flex items-center justify-between gap-3 rounded-lg bg-gray-700/50 p-3'>
          <div className='min-w-0 text-sm font-medium text-white'>
            {host?.name}
          </div>
          <div className='flex items-center gap-2'>
            {host?.isMicrophoneEnabled ? (
              <MicOff className='h-4 w-4 text-red-400 md:h-5 md:w-5' />
            ) : (
              <Mic className='h-4 w-4 text-green-400 md:h-5 md:w-5' />
            )}
            {host?.isCameraEnabled ? (
              <Video className='h-4 w-4 text-green-400 md:h-5 md:w-5' />
            ) : (
              <VideoOff className='h-4 w-4 text-gray-400 md:h-5 md:w-5' />
            )}
          </div>
        </div>
      </div>

      <div>
        <div className='mb-3 flex items-center gap-2 text-sm font-semibold text-white'>
          <div className='h-4 w-1 rounded-full bg-gray-500'></div>
          참가자
        </div>

        <ul className='space-y-2'>
          {/* 발표자를 제외한 참가자 */}
          {participants
            // 같은 참가자가 다른 디바이스(탭)으로 들어오게 되면 identity 첫번째 숫자는 같고 뒤의 알파벳이 달라지므로 첫번째 문자만 꺼내서 비교
            .filter((p) => p.identity[0] !== '1')
            .map((p) => (
              <li
                key={p.sid}
                className='flex items-center justify-between gap-3 rounded-lg bg-gray-700/30 p-3'
              >
                <div className='min-w-0 text-sm font-medium text-white'>
                  {p.name ?? p.identity}
                </div>
                <div className='flex items-center gap-2'>
                  {p.isMicrophoneEnabled ? (
                    <MicOff className='h-4 w-4 text-red-400 md:h-5 md:w-5' />
                  ) : (
                    <Mic className='h-4 w-4 text-green-400 md:h-5 md:w-5' />
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default ParticipantsPanel;
