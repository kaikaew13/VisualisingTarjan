import { useState } from 'react';
import Button from './components/Button';
import GraphContainer from './components/GraphContainer';
import Pseudocode, { LAST_LINE_NO } from './components/Pseudocode';

import { gh } from './assets';
import Result from './components/Result';

export enum Tabs {
  SCC,
  AllDifferent,
}

function App() {
  const [tab, setTab] = useState(Tabs.SCC);
  const [highlightLines, setHighlightLines] = useState('');
  const [fileData, setFileData] = useState('');
  const [result, setResult] = useState([]);
  const [showResult, setShowResult] = useState(false);

  return (
    <div className='w-full h-screen flex flex-col bg-twblack'>
      <div className='flex justify-between'>
        <h1 className='mx-4 mt-4 h-full text-3xl font-semibold text-twwhite font-poppins'>
          Tarjan <span className='text-twpink'>Visualiser</span>
        </h1>

        <div className=' mt-6'>
          <span className='mr-8'>
            <Button
              onClick={() => {
                if (tab === Tabs.SCC) return;
                setTab(Tabs.SCC);
                setFileData('');
              }}
              focus={tab === Tabs.SCC}>
              Basic
            </Button>
          </span>

          <Button
            onClick={() => {
              if (tab === Tabs.AllDifferent) return;
              setTab(Tabs.AllDifferent);
              setFileData('');
            }}
            focus={tab === Tabs.AllDifferent}>
            All-Different
          </Button>
        </div>

        <div className='mt-4 mx-4 ml-20 flex items-center'>
          <Button disabled={false} secondary onClick={() => {}}>
            <>
              <label htmlFor='file-upload' className='hover:cursor-pointer'>
                Import Data
              </label>
              <input
                id='file-upload'
                className='hidden'
                type='file'
                onChange={(e) => {
                  setShowResult(false);
                  if (fileData !== '') {
                    setFileData('');
                  }

                  e.preventDefault();
                  // console.log(e.target.files);

                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    const text = e.target?.result as string;
                    // console.log(text);
                    setFileData(text);
                    // console.log(JSON.parse(text as string));
                  };
                  reader.readAsText(e.target.files![0]);
                  e.target.value = '';
                }}
              />
            </>
          </Button>
          <a
            className='ml-8'
            href='https://github.com/kaikaew13/VisualisingTarjan'
            target='_blank'
            rel='noopener noreferrer'>
            <img src={gh} className='w-8 h-8' />
          </a>
        </div>
      </div>
      <div className='h-full bg-twblack-secondary m-4 p-4 flex flex-row overflow-y-auto rounded-lg'>
        <Pseudocode
          highlightLines={highlightLines}
          setHighlightLines={setHighlightLines}
        />
        <GraphContainer
          tab={tab}
          setHighlightLines={setHighlightLines}
          fileData={fileData}
          setFileData={setFileData}
          setResult={
            setResult as React.Dispatch<React.SetStateAction<string[][]>>
          }
          setShowResult={setShowResult}
        />
        <Result result={result} showResult={showResult} />
      </div>
    </div>
  );
}

export default App;
