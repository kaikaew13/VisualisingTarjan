import { useEffect, useRef, useState } from 'react';
import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
} from 'react-force-graph-2d';
import {
  delay,
  genRandomTree,
  genRandomColor,
  makeAdjList,
  makeEdgeDict,
  genGraphFromJSON,
} from '../utils';
import * as d3Force from 'd3-force';

import Button from './Button';

enum RunStatus {
  Incomplete,
  Running,
  Complete,
}

export const DEFAULT_NODE_COLOR = '#ff0000';
export const DISCOVERED_NODE_COLOR = '#808080';
export const DEFAULT_EDGE_COLOR = '#ccc';
export const HIGHLIGHTED_EDGE_COLOR = '#00ff00';

export interface ITransitionFrame {
  x: INode | IEdge;
  color: string;
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

const Graph = () => {
  const fgRef = useRef<ForceGraphMethods<any, LinkObject<any, IEdge>>>();

  const [cooldownTime, setCooldownTime] = useState(1500);
  const [isRunning, setIsRunning] = useState(RunStatus.Incomplete);
  const [graphData, setGraphData] = useState<IGraphData>({
    nodes: [],
    links: [],
  });
  const [transitionFrames, setTransitionFrames] = useState<ITransitionFrame[]>(
    []
  );

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

  const tarjan = (
    node: INode,
    adjList: number[][],
    edgeDict: IEdge[][],
    id: number[],
    order: number[],
    low: number[],
    vis: boolean[],
    stack: number[],
    result: ITransitionFrame[]
  ) => {
    order[node.id] = id[0];
    low[node.id] = id[0]++;
    vis[node.id] = true;
    stack.push(node.id);
    result.push({ x: node, color: DISCOVERED_NODE_COLOR });
    for (let i = 0; i < adjList[node.id].length; i++) {
      const j = adjList[node.id][i];

      if (order[j] === -1) {
        result.push({ x: edgeDict[node.id][j], color: HIGHLIGHTED_EDGE_COLOR });
        result.push({ x: edgeDict[node.id][j], color: DEFAULT_EDGE_COLOR });
        tarjan(
          graphData.nodes[j],
          adjList,
          edgeDict,
          id,
          order,
          low,
          vis,
          stack,
          result
        );
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
        result.push({ x: graphData.nodes[i!], color: color });
      }

      vis[stack.pop()!] = false;
      result.push({ x: node, color: color });
    }
  };

  const resetGraph = () => {
    graphData.nodes.forEach((each) =>
      changeNodeColor(each, DEFAULT_NODE_COLOR)
    );
  };

  const stepTransition = (result: ITransitionFrame[], i: number) => {
    if ('id' in result[i].x) {
      changeNodeColor(result[i].x as INode, result[i].color);
    } else {
      changeEdgeColor(result[i].x as IEdge, result[i].color);
    }

    return i + 1;
  };

  const playTransition = async (result: ITransitionFrame[], ms: number) => {
    for (let i = 0; i < result.length; i++) {
      if ('id' in result[i].x) {
        changeNodeColor(result[i].x as INode, result[i].color);
      } else {
        changeEdgeColor(result[i].x as IEdge, result[i].color);
      }

      await delay(ms);
    }
  };

  const run = async () => {
    const DELAY_TIME_MS = 250;
    const MAX = 2e9 + 7;
    const id = [0];

    const adjList = makeAdjList(graphData);
    const edgeDict = makeEdgeDict(graphData);

    const order = adjList.map(() => -1);
    const low = adjList.map(() => MAX);
    const vis = adjList.map(() => false);
    const stack: number[] = [];
    const result: ITransitionFrame[] = [];
    setIsRunning(RunStatus.Running);
    await delay(DELAY_TIME_MS);
    for (let i = 0; i < adjList.length; i++) {
      if (order[graphData.nodes[i].id] === -1) {
        tarjan(
          graphData.nodes[i],
          adjList,
          edgeDict,
          id,
          order,
          low,
          vis,
          stack,
          result
        );
      }
    }

    setTransitionFrames(result);
    await playTransition(result, DELAY_TIME_MS);
    setIsRunning(RunStatus.Complete);
    await delay(DELAY_TIME_MS);
  };

  useEffect(() => {
    if (graphData.links.length === 0) {
      // setGraphData(genRandomTree(10) as IGraphData);
      // setGraphData(dummyGraph);

      (async () => {
        setGraphData(await genGraphFromJSON(''));
        await delay(cooldownTime);
        setCooldownTime(0);
      })();
    } else {
      const LINK_LENGTH_CONSTANT = 50;
      const fg = fgRef.current!;
      fg.d3Force('charge', d3Force.forceManyBody().strength(-250));
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
          onEngineStop={() => fgRef.current!.zoomToFit(500)}
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
            // self edge
            if (link.source === link.target) return 0.8;

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
          // dagMode='lr'
          // dagLevelDistance={100}
        />
      </div>
      <div className='w-full'>
        <div className='w-full'>
          <Button disabled={isRunning !== RunStatus.Incomplete} onClick={run}>
            {isRunning ? 'Running' : 'Run'}
          </Button>
          {/* <Button disabled={false} onClick={() => stepTransition()}>
            Step Into
          </Button> */}
        </div>
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
