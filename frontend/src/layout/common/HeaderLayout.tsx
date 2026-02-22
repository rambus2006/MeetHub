import React from 'react';
import Header from '../../components/common/Header';

interface HeaderOnlyLayoutProps {
  readonly children: React.ReactNode;
  readonly centered?: boolean;
}

/**
 * HeaderOnlyLayout : 헤더만 포함하는 레이아웃
 */
function HeaderOnlyLayout({
  children,
  centered = false,
}: HeaderOnlyLayoutProps) {
  return (
    <div className='flex h-screen flex-col bg-gray-100'>
      <header className='h-16 flex-shrink-0'>
        <Header />
      </header>

      <main
        className={`flex-1 overflow-y-auto ${
          centered ? 'flex items-center justify-center' : ''
        }`}
      >
        <div className='h-full w-full'>{children}</div>
      </main>
    </div>
  );
}

export default HeaderOnlyLayout;
