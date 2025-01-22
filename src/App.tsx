import { useState } from 'react';
import Button from './components/Button';
import GraphContainer from './components/GraphContainer';
import Pseudocode, { LAST_LINE_NO } from './components/Pseudocode';

export enum Tabs {
  SCC,
  AllDifferent,
}

function App() {
  const [tab, setTab] = useState(Tabs.SCC);
  const [highlightLines, setHighlightLines] = useState('');
  const [fileData, setFileData] = useState('');

  return (
    <div className='w-full h-screen flex flex-col bg-twblack'>
      <div className='flex'>
        <h1 className='mx-6 mt-6 h-full text-3xl font-semibold text-twwhite font-poppins'>
          Tarjan <span className='text-twpink'>Visualiser</span>
        </h1>

        <div className='mx-auto mt-3'>
          <Button
            onClick={() => {
              if (tab === Tabs.SCC) return;
              setTab(Tabs.SCC);
              setFileData('');
            }}
            focus={tab === Tabs.SCC}>
            SCC
          </Button>
          <Button
            onClick={() => {
              if (tab === Tabs.AllDifferent) return;
              setTab(Tabs.AllDifferent);
              setFileData('');
            }}
            focus={tab === Tabs.AllDifferent}>
            All Different
          </Button>
        </div>
        <div className='mt-3 mx-6'>
          <Button disabled={false} onClick={() => {}}>
            <>
              <label htmlFor='file-upload' className='hover:cursor-pointer'>
                Import file
              </label>
              <input
                id='file-upload'
                className='hidden'
                type='file'
                onChange={(e) => {
                  e.preventDefault();
                  const reader = new FileReader();
                  reader.onload = async (e) => {
                    const text = e.target?.result as string;
                    console.log(text);
                    setFileData(text);
                    console.log(JSON.parse(text as string));
                  };
                  reader.readAsText(e.target.files![0]);
                }}
              />
            </>
          </Button>
        </div>
      </div>
      <div className='h-full mt-3 flex flex-row overflow-y-auto'>
        <Pseudocode
          highlightLines={highlightLines}
          setHighlightLines={setHighlightLines}
        />
        <GraphContainer
          tab={tab}
          setHighlightLines={setHighlightLines}
          fileData={fileData}
        />
      </div>
    </div>
  );
}

export default App;
