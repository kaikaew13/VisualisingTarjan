import { dots, doc } from '../assets';

function Result() {
  return (
    <div className='h-full w-full flex flex-col'>
      <span className='flex flex-row m-0 p-0'>
        <img src={doc} alt='' className='w-7 h-7 mr-2' />
        <h3 className=' text-twwhite text-xl mb-3 font-poppins font-medium'>
          Result
        </h3>
      </span>
      <div className='w-full bg-twblack h-full rounded-lg flex items-center justify-center'>
        <img src={dots} alt='' className='h-[30px]' />
      </div>
    </div>
  );
}

export default Result;
