import type { ChangeEventHandler, ReactNode } from 'react';

// import { useSignUp } from '../../hooks/auth/useSignUp';

interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'date';
  value?: string;
  id?: string;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  error?: string;
  required?: boolean;
  rightElement?: ReactNode;
}

const Input = ({
  label,
  placeholder,
  type = 'text',
  value,
  id,
  onChange,
  error,
  required = false,
  rightElement,
}: InputProps) => {
  const hasRight = !!rightElement;

  // const { emailCheckState } = useSignUp();

  return (
    <div className={`w-full`}>
      {label && (
        <label
          htmlFor={id}
          className={`mb-2 block text-sm font-bold text-gray-700`}
        >
          {label}
          {required && (
            <span className='ml-1 text-red-500' aria-hidden='true'>
              *
            </span>
          )}
        </label>
      )}

      <div className={`relative`}>
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          aria-invalid={!!error}
          aria-required={required}
          className={`w-full rounded-lg border py-3 text-gray-900 placeholder-gray-400 transition-colors duration-200 focus:border-transparent focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500 ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-500 focus:ring-black'} ${hasRight ? 'pl-4 pr-24' : 'px-4'}`.trim()}
        />

        {hasRight && (
          <div
            className={`pointer-events-auto absolute inset-y-0 right-2 flex items-center`}
          >
            {rightElement}
          </div>
        )}
      </div>

      {error && <p className='mt-1 text-sm text-red-500'>{error}</p>}
    </div>
  );
};

export default Input;
