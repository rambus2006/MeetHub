import MainLayout from '../layout/common/MainLayout';
import MeetingList from '../components/home/MeetingList';

const Home = () => {
  return (
    <MainLayout>
      <div className='flex h-full w-full'>
        <MeetingList />
      </div>
    </MainLayout>
  );
};

export default Home;
