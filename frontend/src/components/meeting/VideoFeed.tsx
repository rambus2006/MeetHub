import { VideoOff } from 'lucide-react';

interface VideoFeedProps {
  name?: string;
  isVideoOn?: boolean;
  isMuted?: boolean;
}

function VideoFeed({ name = "참가자", isVideoOn = true, isMuted = false }: VideoFeedProps) {
  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video ">
      {isVideoOn ? (
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
          {/* Placeholder for actual video feed */}
          <div className="text-white text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2 mx-auto">
              <span className="text-2xl">👤</span>
            </div>
            <p className="text-sm font-medium">{name}</p>
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <VideoOff className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm">{name}</p>
          </div>
        </div>
      )}
      
      {/* Name label */}
      <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
        {name}
      </div>
      
      {/* Mute indicator */}
      {isMuted && (
        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          🔇
        </div>
      )}
    </div>
  );
}

export default VideoFeed;
