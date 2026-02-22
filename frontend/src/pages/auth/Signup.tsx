import { useState } from 'react';
import { Link } from 'react-router-dom';

import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

import { useSignUp } from '../../hooks/auth/useSignUp';

const SignUp = () => {
  const {
    handleSignUp,
    errors,
    handleInputChange,
    formData,
    handleEmailDuplicateCheck,
    emailCheckState,
    emailCheckDone,
    isFormValid,
  } = useSignUp();
  const [isPrivacyAgreed, setIsPrivacyAgreed] = useState(false);

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
            handleSignUp();
          }}
        >
          <div>
            <div className='flex items-stretch gap-3'>
              <Input
                id='signup-email'
                label='이메일'
                placeholder='이메일을 입력하세요'
                type='email'
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                error={errors.email}
                required
                rightElement={
                  <button
                    type='button'
                    className='h-8 shrink-0 rounded-md border border-gray-500 bg-white px-3 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50'
                    onClick={handleEmailDuplicateCheck}
                    disabled={!formData.email || !!errors.email}
                  >
                    중복확인
                  </button>
                }
              />
            </div>
            {emailCheckDone && emailCheckState && (
              <p className='mt-1 text-sm text-green-600'>
                사용가능한 이메일입니다.
              </p>
            )}
            {emailCheckDone && !emailCheckState && (
              <p className='mt-1 text-sm text-red-600'>
                사용 중인 이메일입니다.
              </p>
            )}
          </div>

          <Input
            label='이름'
            placeholder='이름을 입력해주세요'
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
          />

          <Input
            label='비밀번호'
            placeholder='비밀번호를 입력하세요'
            type='password'
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            error={errors.password}
            required
          />

          <Input
            label='비밀번호 확인'
            placeholder='비밀번호를 다시 입력해주세요'
            type='password'
            value={formData.confirmPassword}
            onChange={(e) =>
              handleInputChange('confirmPassword', e.target.value)
            }
            error={errors.confirmPassword}
            required
          />

          <label className='flex items-center gap-2 text-sm text-gray-700'>
            <input
              type='checkbox'
              checked={isPrivacyAgreed}
              onChange={(e) => setIsPrivacyAgreed(e.target.checked)}
              className='h-4 w-4 accent-black'
            />
            <span>개인정보 활용 동의</span>
          </label>

          <Button
            disabled={!isFormValid() || !isPrivacyAgreed}
          >
            회원가입
          </Button>
          <p className='text-center text-sm text-gray-500'>
            계정이 있으신가요?{' '}
            <Link to='/signin' className='hover:underline'>
              로그인
            </Link>
          </p>

          <div className='pt-2'>
            <button className='mx-auto block h-11 w-11 rounded-full border border-gray-500 bg-white shadow-sm transition-colors hover:bg-gray-50'>
              {/* 구글 아이콘 자리 */}
              <span className='sr-only'>Google로 가입</span>
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default SignUp;
