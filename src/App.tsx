import Graph from './components/Graph';
import Pseudocode from './components/Pseudocode';

function App() {
  return (
    <div className='w-full h-screen flex flex-col bg-[#111111]'>
      <div>
        <h1 className='mx-6 mt-3 h-full text-3xl font-bold underline text-white'>
          Visualise Tarjan (WIP)
        </h1>
      </div>
      <div className='h-full mt-3 flex flex-row overflow-y-auto'>
        <Pseudocode />
        <Graph />
      </div>
    </div>
  );
}

export default App;
