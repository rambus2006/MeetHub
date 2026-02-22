import { Link } from 'react-router-dom';

interface HeaderProps {
  readonly title?: string;
  readonly onMenuClick?: () => void;
}

function Header({ title = 'MeetHub', onMenuClick }: HeaderProps) {
  return (
    <header className='bg-gray-800 text-white'>
      <div className='flex items-center px-4 py-4'>
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className='mr-3 flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-700 lg:hidden'
            aria-label='메뉴 열기'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='h-5 w-5'
            >
              <line x1='3' y1='6' x2='21' y2='6'></line>
              <line x1='3' y1='12' x2='21' y2='12'></line>
              <line x1='3' y1='18' x2='21' y2='18'></line>
            </svg>
          </button>
        )}

        <Link to='/' className='transition-opacity hover:opacity-80'>
          <h1 className='text-lg font-medium'>{title}</h1>
        </Link>
      </div>
    </header>
  );
}

export default Header;
