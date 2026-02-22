import React, { useState } from 'react';
import Header from '../../components/common/Header';
import Sidebar from '../../components/common/Sidebar';

interface MainLayoutProps {
  readonly children: React.ReactNode;
}

/**
 * MainLayout : 헤더와 사이드바를 포함하는 레이아웃
 * - Sidebar : 반응형으로 lg 이하일 경우 헤더를 통해 접근 가능
 */
function MainLayout({ children }: MainLayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className='flex h-screen flex-col bg-gray-100'>
      <header className='h-16 flex-shrink-0'>
        <Header onMenuClick={() => setIsMobileOpen(true)} />
      </header>
      <div className='flex flex-1 overflow-hidden bg-white'>
        <Sidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} />

        <main className='flex-1 overflow-y-auto'>
          <div className='h-full w-full'>{children}</div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
