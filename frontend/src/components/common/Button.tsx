import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  backgroundColor?: string;
}

const Button = ({
  children,
  onClick,
  disabled = false,
  backgroundColor = '#14299F',
}: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={
        {
          backgroundColor: disabled ? '#9CA3AF' : backgroundColor,
        } as React.CSSProperties
      }
      className={`block w-full rounded-md bg-meethub-blue px-6 py-3 font-medium text-white shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:cursor-not-allowed`.trim()}
    >
      {children}
    </button>
  );
};

export default Button;
