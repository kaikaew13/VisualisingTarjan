import { ReactNode } from 'react';

interface ButtonProps {
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
}

function Button({ disabled = false, children, onClick }: ButtonProps) {
  return (
    // <div className='w-fit mx-auto my-2'>
    <button
      disabled={disabled}
      className='my-2 mx-auto p-2 border border-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 text-white'
      onClick={onClick}>
      {children}
    </button>
    // </div>
  );
}

export default Button;
