export type SnackbarType = {
  key: string; // snackbar identifier
  text: React.ReactNode;
  icon?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  variant: 'success' | 'error' | 'warning' | 'info'; // snackbar variant
};

export type TSnackbarProps = Omit<SnackbarType, 'key'> & {
  handleClose: () => void;
  // open: boolean;
  className?: string;
  // variant: Variant;
};

const Snackbar = ({
  text,
  icon: Icon,
  handleClose,
  variant,
}: TSnackbarProps) => {
  const variants = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };
  return (
    <div className='w-full flex justify-center absolute top-4'>
      <div
        className={`${variants[variant]} flex min-w-[320px] items-center truncate whitespace-nowrap rounded-lg py-3 px-3.5 font-poppins text-sm text-twwhite shadow-md`}>
        {Icon && (
          <span className='mr-4 text-base' aria-hidden='true'>
            <Icon className='h-5 w-5' />
          </span>
        )}
        <span>{text}</span>
        <button
          className='ml-auto bg-transparent !p-0 text-current underline'
          onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
