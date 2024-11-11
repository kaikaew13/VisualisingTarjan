import { CodeBlock, dracula, monokai, monokaiSublime } from 'react-code-blocks';
import Button from './Button';
import { useState } from 'react';
import { delay } from '../utils';

const PSEUDOCODE = `algorithm tarjan is
    for (let i = 0; i < adjList.length; i++) {
      if (order[gData.nodes[i].id] === -1) {
        tarjan();
      }
    }
   
    function strongconnect(v)
        order[node.id] = id[0];
        low[node.id] = id[0]++;
        vis[node.id] = true;
        stack.push(node.id);
        result.push({
        x: node,
        fromColor: DEFAULT_NODE_COLOR,
        toColor: DISCOVERED_NODE_COLOR,
        });
        for (let i = 0; i < adjList[node.id].length; i++) {
        const j = adjList[node.id][i];

        if (order[j] === -1) {
            result.push({
            x: edgeDict[node.id][j],
            fromColor: DEFAULT_EDGE_COLOR,
            toColor: HIGHLIGHTED_EDGE_COLOR,
            });
            result.push({
            x: edgeDict[node.id][j],
            fromColor: HIGHLIGHTED_EDGE_COLOR,
            toColor: DEFAULT_EDGE_COLOR,
            });
            tarjan();
            low[node.id] = Math.min(low[node.id], low[j]);
        } else if (vis[j]) {
            low[node.id] = Math.min(low[node.id], low[j]);
        }
        }

        if (low[node.id] === order[node.id]) {
        const color = genRandomColor();
        while (stack[stack.length - 1] != node.id) {
            const i = stack.pop();
            vis[i!] = false;
            result.push({
            x: gData.nodes[i!],
            fromColor: DISCOVERED_NODE_COLOR,
            toColor: color,
            });
        }

        vis[stack.pop()!] = false;
        result.push({
            x: node,
            fromColor: DISCOVERED_NODE_COLOR,
            toColor: color,
        });
    }`;

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
      <Button onClick={highlightCodeToEnd}>Test</Button>
    </div>
  );
};

export default Pseudocode;
