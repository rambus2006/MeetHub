import { BrowserRouter, Routes, Route } from 'react-router-dom';

import ToastContainer from './components/common/ToastContainer';

import Home from './pages/Home';

import SignIn from './pages/auth/Signin';
import SignUp from './pages/auth/Signup';
import Meeting from './pages/Meeting';
import UserInfo from './pages/UserInfo';
import Report from './pages/Report';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* 홈 라우터 */}
          <Route path='/' element={<Home />} />
          {/* auth 관련 라우터 */}
          <Route path='/signin' element={<SignIn />} />
          <Route path='/signup' element={<SignUp />} />
          <Route path='/userinfo' element={<UserInfo/>}></Route>
          {/* meeting 페이지 라우터 */}
          <Route path='/meeting' element={<Meeting />} />
          {/* 회의 리포트 라우터 */}
          <Route path='/reports/:meetingId' element={<Report />} />
        </Routes>
      </BrowserRouter>

      {/* 토스트 */}
      <ToastContainer />
    </>
  );
}

export default App;
