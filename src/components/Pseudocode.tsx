import { CodeBlock, dracula, monokai, monokaiSublime } from 'react-code-blocks';
import Button from './Button';
import { useState } from 'react';
import { delay } from '../utils';

const PSEUDOCODE = `algorithm tarjan is
    input: graph G = (V, E)
    output: set of strongly connected components (sets of vertices)
   
    index := 0
    S := empty stack
    for each v in V do
        if v.index is undefined then
            strongconnect(v)
   
    function strongconnect(v)
        // Set the depth index for v to the smallest unused index
        v.index := index
        v.lowlink := index
        index := index + 1
        S.push(v)
        v.onStack := true
      
        // Consider successors of v
        for each (v, w) in E do
            if w.index is undefined then
                // Successor w has not yet been visited; recurse on it
                strongconnect(w)
                v.lowlink := min(v.lowlink, w.lowlink)
            else if w.onStack then
                // Successor w is in stack S and hence in the current SCC
                // If w is not on stack, then (v, w) is an edge pointing to an SCC already found and must be ignored
                // See below regarding the next line
                v.lowlink := min(v.lowlink, w.index)
      
        // If v is a root node, pop the stack and generate an SCC
        if v.lowlink = v.index then
            start a new strongly connected component
            repeat
                w := S.pop()
                w.onStack := false
                add w to current strongly connected component
            while w ≠ v
            output the current strongly connected component`;

const LAST_LINE_NO = 39;

const Pseudocode = () => {
  const [highlightLine, setHighlightLine] = useState(0);

  const highlightCodeToEnd = async () => {
    for (let i = 1; i <= LAST_LINE_NO; i++) {
      setHighlightLine(i);
      await delay(250);
    }
  };
  return (
    <div className='w-[35%] h-full px-4 pb-4 text-xs flex flex-col '>
      <h3 className='text-white text-xl mb-3'>Pseudocode</h3>
      <CodeBlock
        text={PSEUDOCODE}
        language='jsx'
        showLineNumbers
        theme={monokaiSublime}
        highlight={highlightLine.toString()}
        customStyle={{
          overflowY: 'scroll',
          height: '100%',
        }}
      />
      <Button onClick={highlightCodeToEnd}>HELLO</Button>
    </div>
  );
};

export default Pseudocode;
