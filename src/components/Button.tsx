import { ReactNode } from 'react';

interface ButtonProps {
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
  focus?: boolean;
}

function Button({
  disabled = false,
  children,
  onClick,
  focus = false,
}: ButtonProps) {
  return (
    // <div className='w-fit mx-auto my-2'>
    <button
      disabled={disabled}
      className={` ${focus && 'bg-gray-300 text-[#111111] hover:bg-gray-400'}
      my-2 mx-auto p-2 border border-gray-300 disabled:cursor-not-allowed disabled:text-gray-400 text-white
      hover:bg-[#222222]`}
      onClick={onClick}>
      {children}
    </button>
    // </div>
  );
}

export default Button;
