import { useEffect, useRef, useState } from 'react';
import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
} from 'react-force-graph-2d';
import {
  delay,
  genRandomTree,
  getRandomColor,
  makeAdjList,
  makeEdgeDict,
} from '../utils';
import * as d3Force from 'd3-force';

import Button from './Button';

enum RunStatus {
  Incomplete,
  Running,
  Complete,
}

const DEFAULT_NODE_COLOR = '#ff0000';
const DISCOVERED_NODE_COLOR = '#cc7000';
const DEFAULT_EDGE_COLOR = '#ccc';
const HIGHLIGHTED_EDGE_COLOR = '#00ff00';

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
    { id: 0, val: 1, name: 'node 0', color: DEFAULT_NODE_COLOR },
    { id: 1, val: 1, name: 'node 1', color: DEFAULT_NODE_COLOR },
    { id: 2, val: 1, name: 'node 2', color: DEFAULT_NODE_COLOR },
    { id: 3, val: 1, name: 'node 3', color: DEFAULT_NODE_COLOR },
    { id: 4, val: 1, name: 'node 4', color: DEFAULT_NODE_COLOR },
    { id: 5, val: 1, name: 'node 5', color: DEFAULT_NODE_COLOR },
    { id: 6, val: 1, name: 'node 6', color: DEFAULT_NODE_COLOR },
    { id: 7, val: 1, name: 'node 7', color: DEFAULT_NODE_COLOR },
  ],
  links: [
    { source: 0, target: 1, name: '0 -> 1', color: DEFAULT_EDGE_COLOR },
    { source: 1, target: 2, name: '1 -> 2', color: DEFAULT_EDGE_COLOR },
    { source: 2, target: 0, name: '2 -> 0', color: DEFAULT_EDGE_COLOR },
    { source: 3, target: 1, name: '3 -> 1', color: DEFAULT_EDGE_COLOR },
    { source: 3, target: 2, name: '3 -> 2', color: DEFAULT_EDGE_COLOR },
    { source: 3, target: 4, name: '3 -> 4', color: DEFAULT_EDGE_COLOR },
    { source: 4, target: 3, name: '4 -> 3', color: DEFAULT_EDGE_COLOR },
    { source: 4, target: 5, name: '4 -> 5', color: DEFAULT_EDGE_COLOR },
    { source: 5, target: 2, name: '5 -> 2', color: DEFAULT_EDGE_COLOR },
    { source: 5, target: 6, name: '5 -> 6', color: DEFAULT_EDGE_COLOR },
    { source: 6, target: 5, name: '6 -> 5', color: DEFAULT_EDGE_COLOR },
    { source: 7, target: 4, name: '7 -> 4', color: DEFAULT_EDGE_COLOR },
    { source: 7, target: 6, name: '7 -> 6', color: DEFAULT_EDGE_COLOR },
  ],
};

const Graph = () => {
  const fgRef = useRef<ForceGraphMethods<any, LinkObject<any, IEdge>>>();

  const [cooldownTime, setCooldownTime] = useState(1500);
  const [isRunning, setIsRunning] = useState(RunStatus.Incomplete);
  const [graphData, setGraphData] = useState<IGraphData>({
    nodes: [],
    links: [],
  });

  const changeEdgeColor = (edge: IEdge, color: string) => {
    const tmp = { ...graphData };
    tmp.links.forEach((each) => {
      if (each.name === edge.name) {
        each.color = color;
        return;
      }
    });

    setGraphData(tmp);
  };

  const changeNodeColor = (node: INode, color: string) => {
    const tmp = { ...graphData };
    tmp.nodes[node.id].color = color;
    setGraphData(tmp);
    // node.color = color;
  };

  const tarjan = async (
    node: INode,
    adjList: number[][],
    edgeDict: IEdge[][],
    id: number[],
    order: number[],
    low: number[],
    vis: boolean[],
    stack: number[],
    ms: number
  ) => {
    order[node.id] = id[0];
    low[node.id] = id[0]++;
    vis[node.id] = true;
    stack.push(node.id);
    changeNodeColor(node, DISCOVERED_NODE_COLOR);
    await delay(ms);
    for (let i = 0; i < adjList[node.id].length; i++) {
      const j = adjList[node.id][i];

      if (order[j] === -1) {
        changeEdgeColor(edgeDict[node.id][j], HIGHLIGHTED_EDGE_COLOR);
        await delay(ms);
        changeEdgeColor(edgeDict[node.id][j], DEFAULT_EDGE_COLOR);
        await delay(ms);
        await tarjan(
          graphData.nodes[j],
          adjList,
          edgeDict,
          id,
          order,
          low,
          vis,
          stack,
          ms
        );
        low[node.id] = Math.min(low[node.id], low[j]);
      } else if (vis[j]) {
        low[node.id] = Math.min(low[node.id], low[j]);
      }
    }

    if (low[node.id] === order[node.id]) {
      const color = getRandomColor();
      while (stack[stack.length - 1] != node.id) {
        const i = stack.pop();
        vis[i!] = false;
        changeNodeColor(graphData.nodes[i!], color);
        await delay(ms);
      }

      vis[stack.pop()!] = false;
      changeNodeColor(node, color);
      await delay(ms);
    }
  };

  const resetGraph = () => {
    graphData.nodes.forEach((each) =>
      changeNodeColor(each, DEFAULT_NODE_COLOR)
    );
  };

  const run = async () => {
    const DELAY_TIME_MS = 300;
    const MAX = 2e9 + 7;
    const id = [0];

    const adjList = makeAdjList(graphData);
    const edgeDict = makeEdgeDict(graphData);

    const order = adjList.map(() => -1);
    const low = adjList.map(() => MAX);
    const vis = adjList.map(() => false);
    const stack: number[] = [];
    setIsRunning(RunStatus.Running);
    await delay(DELAY_TIME_MS);
    for (let i = adjList.length - 1; i >= 0; i--) {
      if (order[graphData.nodes[i].id] === -1) {
        await tarjan(
          graphData.nodes[i],
          adjList,
          edgeDict,
          id,
          order,
          low,
          vis,
          stack,
          DELAY_TIME_MS
        );
      }
    }

    setIsRunning(RunStatus.Complete);
    await delay(DELAY_TIME_MS);
  };

  useEffect(() => {
    if (graphData.links.length === 0) {
      // setGraphData(genRandomTree(10) as IGraphData);
      setGraphData(dummyGraph);

      (async () => {
        await delay(cooldownTime);
        setCooldownTime(0);
      })();
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
          cooldownTime={cooldownTime}
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
          linkCurvature={(link) => {
            let cnt = 0;
            const tmp = graphData.links;
            for (let i = 0; i < tmp.length; i++) {
              if (
                tmp[i].source === link.source &&
                tmp[i].target === link.target
              )
                cnt++;
              if (
                tmp[i].source === link.target &&
                tmp[i].target === link.source
              )
                cnt++;
            }

            return cnt === 2 ? 0.1 : 0;
          }}
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
