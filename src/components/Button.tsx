import { ReactNode } from 'react';

interface ButtonProps {
  disabled?: boolean;
  children: ReactNode;
  onClick: () => void;
  focus?: boolean;
  secondary?: boolean;
}

function Button({
  disabled = false,
  children,
  onClick,
  focus = false,
  secondary = false,
}: ButtonProps) {
  return secondary ? (
    <button
      disabled={disabled}
      className={` 
        py-2 px-4 bg-twwhite rounded-lg hover:bg-twblack hover:text-twwhite border hover:border-twwhite
       disabled:cursor-not-allowed disabled:text-twwhite-secondary text-twblack text-base font-poppins font-medium
      `}
      onClick={onClick}>
      {children}
    </button>
  ) : (
    // <div className='w-fit mx-auto my-2'>
    <button
      disabled={disabled}
      className={` 
        ${focus && 'underline'}
       disabled:cursor-not-allowed disabled:text-twwhite-secondary text-twwhite text-base font-poppins font-medium
      `}
      onClick={onClick}>
      {children}
    </button>
    // </div>
  );
}

export default Button;
