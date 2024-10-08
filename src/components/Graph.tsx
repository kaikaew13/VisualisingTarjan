import { useEffect, useRef, useState } from 'react';
import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
} from 'react-force-graph-2d';
import { delay, genRandomTree, makeAdjList } from '../utils';
import * as d3Force from 'd3-force';

import Button from './Button';

enum RunStatus {
  Incomplete,
  Running,
  Complete,
}

export interface IGraphData {
  nodes: INode[];
  links: IEdge[];
}

export interface IEdge {
  source: any;
  target: any;
  name?: string;
  color?: string;
  [key: string]: any;
}

export interface INode {
  id: number;
  val?: number;
  name?: string;
  color?: string;
  [key: string]: any;
}

const dummyGraph: IGraphData = {
  nodes: [
    { id: 0, val: 1, name: 'node 0', color: '#ff0000' },
    { id: 1, val: 1, name: 'node 1', color: '#ff0000' },
    { id: 2, val: 1, name: 'node 2', color: '#ff0000' },
    { id: 3, val: 1, name: 'node 3', color: '#ff0000' },
    { id: 4, val: 1, name: 'node 4', color: '#ff0000' },
    { id: 5, val: 1, name: 'node 5', color: '#ff0000' },
    { id: 6, val: 1, name: 'node 6', color: '#ff0000' },
    { id: 7, val: 1, name: 'node 7', color: '#ff0000' },
  ],
  links: [
    { source: 0, target: 1, color: '#ccc' },
    { source: 1, target: 2, color: '#ccc' },
    { source: 2, target: 0, color: '#ccc' },
    { source: 3, target: 1, color: '#ccc' },
    { source: 3, target: 2, color: '#ccc' },
    { source: 3, target: 4, color: '#ccc' },
    { source: 4, target: 3, color: '#ccc' },
    { source: 4, target: 5, color: '#ccc' },
    { source: 5, target: 2, color: '#ccc' },
    { source: 5, target: 6, color: '#ccc' },
    { source: 6, target: 5, color: '#ccc' },
    { source: 7, target: 4, color: '#ccc' },
    { source: 7, target: 6, color: '#ccc' },
  ],
};

const Graph = () => {
  const fgRef = useRef<ForceGraphMethods<any, LinkObject<any, IEdge>>>();

  const [isRunning, setIsRunning] = useState(RunStatus.Incomplete);
  const [graphData, setGraphData] = useState<IGraphData>({
    nodes: [],
    links: [],
  });

  const changeNodeColor = (node: INode, color: string) => {
    node.color = color;
  };

  const dfs = async (
    node: INode,
    adjList: number[][],
    vis: boolean[],
    ms: number
  ) => {
    if (vis[node.id]) return;
    vis[node.id] = true;
    console.log(node.id);
    changeNodeColor(node, '#cc7000');
    await delay(ms);
    for (let i = 0; i < adjList[node.id].length; i++) {
      await dfs(graphData.nodes[adjList[node.id][i]], adjList, vis, ms);
    }

    changeNodeColor(node, '#00cc70');
    await delay(ms);
  };

  const resetGraph = () => {
    const tmp = { ...graphData };
    tmp.nodes.forEach((each) => changeNodeColor(each, '#ff0000'));
  };

  const run = async () => {
    const DELAY_TIME_MS = 250;
    const MAX = 1e9 + 7;
    let id = 0;

    const adjList = makeAdjList(graphData);
    const order = adjList.map(() => -1);
    const low = adjList.map(() => MAX);
    const vis = adjList.map(() => false);
    const stack: number[] = [];
    setIsRunning(RunStatus.Running);
    await delay(DELAY_TIME_MS);
    for (let i = 0; i < adjList.length; i++) {
      if (!vis[graphData.nodes[i].id]) {
        await dfs(graphData.nodes[i], adjList, vis, DELAY_TIME_MS);
      }
    }
    setIsRunning(RunStatus.Complete);
    await delay(DELAY_TIME_MS);
  };

  useEffect(() => {
    if (graphData.links.length === 0) {
      // setGraphData(genRandomTree(10) as IGraphData);
      setGraphData(dummyGraph);
    } else {
      const LINK_LENGTH_CONSTANT = 30;
      const fg = fgRef.current!;
      fg.d3Force('charge', d3Force.forceManyBody().strength(-300));
      fg.d3Force('link')!.distance(() => LINK_LENGTH_CONSTANT);
    }
  }, [graphData]);

  return (
    <>
      <div className='overflow-hidden mt-3'>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          // cooldownTicks={100}
          // cooldownTime={1500}
          height={screen.height * 0.65}
          width={screen.width}
          maxZoom={5}
          backgroundColor='black'
          enablePanInteraction={true}
          autoPauseRedraw
          // node attr
          enableNodeDrag={true}
          nodeRelSize={10}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 10 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(label, node.x, node.y);
          }}
          // link attr
          linkDirectionalArrowLength={5}
          linkDirectionalArrowRelPos={1}
          // linkCurvature={0.1}
          // dagMode='td'
          // dagLevelDistance={50}
        />
      </div>
      <div className='w-full'>
        <Button disabled={isRunning !== RunStatus.Incomplete} onClick={run}>
          {isRunning ? 'Running' : 'Run'}
        </Button>
        <Button
          disabled={isRunning === RunStatus.Running}
          onClick={() => {
            resetGraph();
            setIsRunning(RunStatus.Incomplete);
          }}>
          Reset
        </Button>
      </div>
    </>
  );
};

export default Graph;
