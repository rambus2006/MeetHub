interface ReportHeaderProps {
  title: string;
  // presenter: string;
  date: string;
  duration: string;
  isSharing: boolean;
  onShareClick: () => void;
  isDeleting: boolean;
  onDeleteClick: () => void;
}

const ReportHeader = ({
  title,
  // presenter,
  date,
  duration,
  isSharing,
  onShareClick,
  isDeleting,
  onDeleteClick,
}: ReportHeaderProps) => {
  return (
    <div className='mb-6 flex items-center justify-between'>
      <div>
        <h1 className='text-3xl font-bold'>{title}</h1>
        <p className='mt-1 text-sm text-gray-500'>
          {date} • {duration}
        </p>
      </div>
      <div className='flex space-x-3'>
        <button
          onClick={onShareClick}
          disabled={isSharing || isDeleting}
          className='rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isSharing ? '공유 중...' : '공유'}
        </button>

        <button
          onClick={onDeleteClick}
          disabled={isDeleting || isSharing}
          className='rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isDeleting ? '삭제 중...' : '삭제'}
        </button>
      </div>
    </div>
  );
};

export default ReportHeader;
