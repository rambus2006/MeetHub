import { useState, useRef, useEffect } from 'react';
import {
  SquareChartGantt,
  MessageSquare,
  Contact,
  X,
  Send,
} from 'lucide-react';
import ParticipantsPanel from './ParticipantsPanel';

export default function Sidebar() {
  const [activeItem, setActiveItem] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, sender: '김철수', text: '안녕하세요!', isMe: false },
    { id: 2, sender: '나', text: '네, 안녕하세요!', isMe: true },
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // 메시지가 추가될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const menuItems = [
    { id: 'contact', icon: Contact, label: '참가자' },
    { id: 'chat', icon: MessageSquare, label: '채팅' },
    { id: 'summary', icon: SquareChartGantt, label: '회의록요약' },
  ];

  const handleItemClick = (id: string) => {
    if (activeItem === id && isExpanded) {
      // 같은 아이콘을 다시 클릭하면 닫기
      setIsExpanded(false);
      setActiveItem('');
    } else {
      // 다른 아이콘을 클릭하면 해당 내용 표시
      setActiveItem(id);
      setIsExpanded(true);
    }
  };

  const handleClose = () => {
    setIsExpanded(false);
    setActiveItem('');
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      // 새 메시지 추가
      const newMessage = {
        id: messages.length + 1,
        sender: '나',
        text: chatMessage,
        isMe: true,
      };
      setMessages([...messages, newMessage]);
      setChatMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // 아이콘별 사이드바 내용 렌더링
  const renderSidebarContent = () => {
    switch (activeItem) {
      // 참가자 패널
      case 'contact':
        return <ParticipantsPanel />;
      case 'chat':
        return (
          <div className='flex h-[calc(100vh-200px)] flex-col'>
            <div
              ref={chatContainerRef}
              className='scrollbar-hide flex-1 space-y-2 overflow-y-auto'
            >
              <div className='flex flex-col gap-2'>
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-2 ${message.isMe ? 'justify-end' : ''}`}
                  >
                    {!message.isMe && (
                      <div className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xs text-white'>
                        {message.sender.charAt(0)}
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-lg p-2 ${
                        message.isMe ? 'bg-blue-600' : 'bg-gray-700'
                      }`}
                    >
                      <p className='text-xs text-white'>{message.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 채팅 입력창 */}
            <div className='mt-4 flex gap-2 pb-4'>
              <input
                type='text'
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder='메시지를 입력하세요...'
                className='flex-1 rounded-lg bg-gray-700 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
              <button
                onClick={handleSendMessage}
                className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 transition-colors hover:bg-blue-700'
              >
                <Send size={16} className='text-white' />
              </button>
            </div>
          </div>
        );
      case 'summary':
        return (
          <div className='space-y-2'>
            <div className='space-y-3'>
              <div className='rounded-lg bg-gray-700 p-3'>
                <h3 className='mb-2 text-sm font-medium text-white'>
                  회의 내용
                </h3>
                <p className='text-xs text-gray-300'>
                  • 태안교육지원청 일반현황 논의
                </p>
                <p className='text-xs text-gray-300'>• 사업방향 확인</p>
                <p className='text-xs text-gray-300'>
                  • 2020-2035 타임라인 검토
                </p>
              </div>
              <div className='rounded-lg bg-gray-700 p-3'>
                <h3 className='mb-2 text-sm font-medium text-white'>참가자</h3>
                <p className='text-xs text-gray-300'>• 김철수 (발표자)</p>
                <p className='text-xs text-gray-300'>• 이영희 (참석자)</p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* 확장된 사이드바 */}
      {isExpanded && (
        <aside className='absolute right-16 top-0 z-10 flex h-full w-80 flex-col gap-4 rounded-l-[16px] bg-gray-800 px-4 pt-16 shadow-lg'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-white'>
              {menuItems.find((item) => item.id === activeItem)?.label ||
                '메뉴'}
            </h2>
            <button
              onClick={handleClose}
              className='flex h-8 w-8 items-center justify-center rounded-lg text-white hover:bg-gray-700'
            >
              <X size={16} />
            </button>
          </div>

          {renderSidebarContent()}
        </aside>
      )}

      {/* 기본 사이드바 */}
      <aside className='absolute right-0 top-0 z-0 flex h-full w-16 flex-col items-center gap-4 rounded-l-[16px] bg-black pt-24'>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all hover:bg-gray-900 ${
                isActive ? 'bg-gray-800 text-white' : 'text-white'
              }`}
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={2} />
            </button>
          );
        })}
      </aside>
    </>
  );
}
