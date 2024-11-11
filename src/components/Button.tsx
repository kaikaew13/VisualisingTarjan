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
      className={` ${
        focus &&
        'bg-[#888888] text-[#111111] hover:bg-[#aaaaaa] hover:border-[#aaaaaa]'
      }
      my-2 mx-auto p-2 border border-[#888888] disabled:cursor-not-allowed disabled:text-[#999999] text-[#ccc]
      hover:bg-[#333333]`}
      onClick={onClick}>
      {children}
    </button>
    // </div>
  );
}

export default Button;
