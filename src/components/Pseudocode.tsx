import {
  CodeBlock,
  dracula,
  monokai,
  monokaiSublime,
  github,
} from 'react-code-blocks';
import Button from './Button';
import { Dispatch, SetStateAction, useEffect } from 'react';

export const highlightCodeLines = {
  mainloop: '1-3',
  tarjaninit: '5-9,11',
  neighborloop: '11',
  neighborif: '12-13',
  neighborafterif: '14',
  neighborelse: '15-16',
  sccif: '18-19',
  sccnoif: '18',
  sccwhile: '20-23',
  sccend: '24-26',
  return: '27',
};

const PSEUDOCODE = `for each vertex v:
    if v.index is undefined:
        tarjan(v)
   
function tarjan(v):
    v.index = v.lowlink = index
    index++
    stack.push(v)
    onStack[v] = true

    for each neighbor w of v:
        if w.index is undefined:
            tarjan(w)
            v.lowlink = min(v.lowlink, w.lowlink)
        else if w not in SCC:
            v.lowlink = min(v.lowlink, w.lowlink)
  
    if v.index == v.lowlink:
        SCC = []
        while stack.top != v:
            w = stack.pop()
            onStack[w] = false
            SCC.add(w)
        w = stack.pop()
        onStack[w] = false
        SCC.add(w)
    return
  
  `;

export const LAST_LINE_NO = 27;

interface PseudocodeProps {
  highlightLines: string;
  setHighlightLines: Dispatch<SetStateAction<string>>;
}

const Pseudocode = ({ highlightLines }: PseudocodeProps) => {
  useEffect(() => {}, [highlightLines]);
  return (
    <div className='h-full text-xs flex flex-col '>
      <h3 className='text-twpink text-xl mb-3 font-poppins font-medium'>
        Pseudocode
      </h3>
      <CodeBlock
        text={PSEUDOCODE}
        language='jsx'
        showLineNumbers
        theme={dracula}
        // highlight={highlightLines}
        customStyle={{
          overflowY: 'scroll',
          height: '100%',
          backgroundColor: '#0E0D11',
          borderRadius: '8px',
        }}
      />
    </div>
  );
};

export default Pseudocode;
