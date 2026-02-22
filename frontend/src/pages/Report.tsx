import MainLayout from '../layout/common/MainLayout';
import ReportDetail from '../components/report/ReportDetail';

const Report = () => {
  return (
    <MainLayout>
      <div className='flex h-full w-full overflow-hidden'>
        <ReportDetail />
      </div>
    </MainLayout>
  );
};

export default Report;
