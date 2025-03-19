import { dots, doc } from '../assets';
import { HCCCaseMap } from '../utils';
import { IEdge } from './GraphContainer';

interface ResultProps {
  resSCCs: string[][];
  resHCC?: IEdge[][];
  resAllDiff?: { [key: string]: string[] };
  showResult: boolean;
}

function Result({
  resSCCs,
  resHCC = [],
  resAllDiff = undefined,
  showResult,
}: ResultProps) {
  return (
    <div className='h-full w-full flex flex-col'>
      <span className='flex flex-row m-0 p-0'>
        <img src={doc} alt='' className='w-7 h-7 mr-2' />
        <h3 className=' text-twwhite text-xl mb-3 font-poppins font-medium'>
          Result
        </h3>
      </span>
      {!showResult ? (
        <div className='w-full bg-twblack-secondary h-full rounded-lg flex items-center justify-center'>
          <img src={dots} alt='' className='h-[30px]' />
        </div>
      ) : (
        <div className='w-full bg-twblack-secondary h-full rounded-lg flex flex-col p-3 overflow-y-auto'>
          {resHCC.length > 0 &&
            resHCC.map((val, i) => (
              <div key={i} className={`p-3 mb-3`}>
                <div className='text-twwhite font-medium text-sm font-poppins underline'>
                  {`Case ${i + 1}: ${HCCCaseMap[i]}`}
                </div>
                {val.map((each, j) => (
                  <div
                    key={j}
                    className='text-twwhite font-normal text-sm font-poppins'>
                    {each.name}
                  </div>
                ))}
              </div>
            ))}
          {resAllDiff && (
            <div className='p-3 mb-3'>
              <div className='text-twwhite font-medium text-sm font-poppins underline mb-3'>
                All-Different Mapping
              </div>
              {Object.keys(resAllDiff).map((eachU, i) => (
                <div
                  key={i}
                  className='text-twwhite font-normal text-sm font-poppins'>{`${eachU} -> ${resAllDiff[
                  eachU
                ].map((eachV) => ` ${eachV}`)}`}</div>
              ))}
            </div>
          )}
          {resSCCs.map((val, i) => (
            <div
              key={i}
              className={`bg-twblack-secondary p-3 rounded-lg ${
                i !== resSCCs.length - 1 && 'mb-3'
              }`}>
              <div className='text-twwhite font-medium text-sm font-poppins underline'>
                SCC #{i + 1}
              </div>

              {val.map((each, j) => (
                <span
                  key={j}
                  className='text-twwhite font-normal text-sm font-poppins'>
                  {each}
                  {j !== val.length - 1 && ', '}
                </span>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Result;
