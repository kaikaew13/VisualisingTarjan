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
  fromColor: string;
  toColor: string;
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
  const [transitionFramesIdx, setTransitionFramesIdx] = useState(0);

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
    gData: IGraphData,
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
        tarjan(
          gData,
          gData.nodes[j],
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
    }
  };

  const resetGraph = () => {
    setTransitionFramesIdx(0);
    graphData.nodes.forEach((each) =>
      changeNodeColor(each, DEFAULT_NODE_COLOR)
    );
  };

  const playNextTransition = (result: ITransitionFrame[], i: number) => {
    if ('id' in result[i].x) {
      changeNodeColor(result[i].x as INode, result[i].toColor);
    } else {
      changeEdgeColor(result[i].x as IEdge, result[i].toColor);
    }

    setTransitionFramesIdx(i + 1);
  };

  const playPrevTransition = (result: ITransitionFrame[], i: number) => {
    i--;

    if ('id' in result[i].x) {
      changeNodeColor(result[i].x as INode, result[i].fromColor);
    } else {
      changeEdgeColor(result[i].x as IEdge, result[i].fromColor);
    }

    setTransitionFramesIdx(i);
  };

  const playTransitionToEnd = async (
    result: ITransitionFrame[],
    ms: number,
    i: number
  ) => {
    for (let j = i; j < result.length; j++) {
      playNextTransition(result, j);
      await delay(ms);
    }
  };

  const runTarjan = (gData: IGraphData) => {
    const MAX = 2e9 + 7;
    const id = [0];

    const adjList = makeAdjList(gData);
    const edgeDict = makeEdgeDict(gData);

    const order = adjList.map(() => -1);
    const low = adjList.map(() => MAX);
    const vis = adjList.map(() => false);
    const stack: number[] = [];
    const result: ITransitionFrame[] = [];
    for (let i = 0; i < adjList.length; i++) {
      if (order[gData.nodes[i].id] === -1) {
        tarjan(
          gData,
          gData.nodes[i],
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
  };

  useEffect(() => {
    if (graphData.links.length === 0) {
      // setGraphData(genRandomTree(10) as IGraphData);
      // setGraphData(dummyGraph);

      (async () => {
        const gData = await genGraphFromJSON('');
        runTarjan(gData);
        setGraphData(gData);
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
    <div className=''>
      <h3 className='text-white text-xl mb-3'>Visualisation</h3>
      <div>
        <ForceGraph2D
          ref={fgRef}
          graphData={graphData}
          // cooldownTicks={100}
          cooldownTime={cooldownTime}
          height={screen.height * 0.55}
          width={screen.width * 0.65}
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
        <div className='w-fit mx-auto'>
          <div className='w-full inline-block'>
            <Button
              disabled={
                isRunning === RunStatus.Running || transitionFramesIdx === 0
              }
              onClick={() => {
                playPrevTransition(transitionFrames, transitionFramesIdx);
                if (0 === transitionFramesIdx) {
                  setIsRunning(RunStatus.Incomplete);
                }
              }}>
              Prev
            </Button>
            <Button
              disabled={
                isRunning !== RunStatus.Incomplete ||
                transitionFramesIdx === transitionFrames.length
              }
              onClick={async () => {
                setIsRunning(RunStatus.Running);
                await delay(250);
                await playTransitionToEnd(
                  transitionFrames,
                  250,
                  transitionFramesIdx
                );
                setIsRunning(RunStatus.Complete);
                await delay(250);
              }}>
              {isRunning ? 'Running' : 'Run'}
            </Button>
            <Button
              disabled={
                isRunning === RunStatus.Running ||
                transitionFramesIdx === transitionFrames.length
              }
              onClick={() => {
                playNextTransition(transitionFrames, transitionFramesIdx);
                if (transitionFramesIdx === transitionFrames.length) {
                  setIsRunning(RunStatus.Complete);
                }
              }}>
              Next
            </Button>
          </div>
        </div>
        <div className='w-fit mx-auto'>
          <Button
            disabled={isRunning === RunStatus.Running}
            onClick={() => {
              resetGraph();
              setIsRunning(RunStatus.Incomplete);
            }}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Graph;
