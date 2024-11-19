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

  return (
    <div className='w-full h-screen flex flex-col bg-[#111111]'>
      <div className='flex'>
        <h1 className='mx-6 mt-3 h-full text-3xl font-bold text-white'>
          Visualise Tarjan (WIP)
        </h1>
        <div className='mx-auto mt-3'>
          <Button
            onClick={() => {
              if (tab === Tabs.SCC) return;
              setTab(Tabs.SCC);
            }}
            focus={tab === Tabs.SCC}>
            SCC
          </Button>
          <Button
            onClick={() => {
              if (tab === Tabs.AllDifferent) return;
              setTab(Tabs.AllDifferent);
            }}
            focus={tab === Tabs.AllDifferent}>
            All Different
          </Button>
        </div>
      </div>
      <div className='h-full mt-3 flex flex-row overflow-y-auto'>
        <Pseudocode
          highlightLines={highlightLines}
          setHighlightLines={setHighlightLines}
        />
        <GraphContainer tab={tab} setHighlightLines={setHighlightLines} />
      </div>
    </div>
  );
}

export default App;
