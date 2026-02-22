import { useState, useEffect } from 'react';

import { useMeetingStore } from '../../store/useMeetingStore';

function MeetingHeader() {
  const [currentTime, setCurrentTime] = useState('00:00');

  const storedDisplayName = useMeetingStore((s) => s.displayName);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='flex items-center justify-between bg-black px-2 py-2 text-white md:px-4 md:py-3'>
      {/* Left side - Title and Logo */}
      <div className='flex items-center space-x-2 md:space-x-4'>
        <h1 className='text-sm font-semibold md:text-lg'>
          {storedDisplayName}
        </h1>
      </div>

      {/* Right side - Time and window controls */}
      <div className='flex items-center space-x-1 md:space-x-2'>
        <span className='text-xs font-medium text-white md:text-sm'>
          {currentTime}
        </span>
      </div>
    </div>
  );
}

export default MeetingHeader;
