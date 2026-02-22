import { Link } from 'react-router-dom';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

import { useSignIn } from '../../hooks/auth/useSignIn';

const SignIn = () => {
  const {
    formData,
    errors,
    isLoading,
    handleInputChange,
    handleSignIn,
    isFormValid,
  } = useSignIn();

  return (
    <main className='grid min-h-screen w-full max-w-[100vw] place-items-center bg-gray-200 px-4 overflow-x-hidden overflow-y-hidden'>
      <section className='mx-4 my-0 w-full max-w-lg rounded-2xl border border-meethub-blue bg-white p-6 overflow-hidden'>
        <header className='mb-8 text-center'>
          <h1 className='text-4xl font-extrabold italic tracking-tight text-meethub-blue'>
            MeetHub
          </h1>
        </header>

        <form
          className='space-y-4 p-5'
          onSubmit={(e) => {
            e.preventDefault();
            handleSignIn();
          }}
        >
          <Input
            label='이메일'
            placeholder='이메일을 입력해주세요'
            type='email'
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
          />
          <Input
            label='비밀번호'
            placeholder='비밀번호를 입력해주세요'
            type='password'
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password}
            required
          />
          <div className='pt-4'>
            <Button
              onClick={handleSignIn}
              disabled={!isFormValid() || isLoading}
            >
              로그인
            </Button>
          </div>

          <p className='text-center text-sm text-gray-500'>
            <Link to='/signup' className='hover:underline'>
              회원가입
            </Link>
            <span className='mx-1'>/</span>
            {' '}비밀번호 찾기
          </p>

          <div className='pt-2'>
            <button className='mx-auto block h-11 w-11 rounded-full border border-gray-500 bg-white shadow-sm transition-colors hover:bg-gray-50'>
              <span className='sr-only'>Google로 로그인</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default SignIn;
