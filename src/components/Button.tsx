import { ReactNode } from 'react';

interface ButtonProps {
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}

function Button({ disabled = false, children, onClick }: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className='my-2 block mx-auto p-2 border border-gray-300 disabled:cursor-not-allowed disabled:text-gray-400'
      onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
