import { useEffect, useRef, useState } from 'react';
import { ForceGraphMethods, LinkObject } from 'react-force-graph-2d';
import {
  delay,
  genRandomColor,
  makeAdjList,
  makeEdgeDict,
  getUandVVertices,
  genGraphFromObject,
} from '../utils';

import Button from './Button';
import { Tabs } from '../App';
import Graph from './Graph';
import Bigraph from './Bigraph';

enum RunStatus {
  Incomplete,
  Running,
  Complete,
}

interface GraphContainerProps {
  tab: Tabs;
}

export const DEFAULT_NODE_COLOR = '#333333';
export const DISCOVERED_NODE_COLOR = '#888888';
export const DEFAULT_EDGE_COLOR = '#ccc';
export const HIGHLIGHTED_EDGE_COLOR = '#00ff00';

export interface ITransitionFrame {
  x: INode | IEdge | INode[] | IEdge[];
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

const GraphContainer = ({ tab }: GraphContainerProps) => {
  const fgRef = useRef<ForceGraphMethods<any, LinkObject<any, IEdge>>>();

  const [isRunning, setIsRunning] = useState(RunStatus.Incomplete);
  const [graphData, setGraphData] = useState<IGraphData>({
    nodes: [],
    links: [],
  });
  const [tmpGraphData, setTmpGraphData] = useState<IGraphData>({
    nodes: [],
    links: [],
  });
  const [transitionFrames, setTransitionFrames] = useState<ITransitionFrame[]>(
    []
  );
  const [transitionFramesIdx, setTransitionFramesIdx] = useState(0);
  const [isDirected, setIsDirected] = useState(false);

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
      fromColor: node.color!,
      toColor: DISCOVERED_NODE_COLOR,
    });
    for (let i = 0; i < adjList[node.id].length; i++) {
      const j = adjList[node.id][i];

      if (order[j] === -1) {
        let edge = edgeDict[node.id][j];

        result.push({
          x: edge,
          fromColor: edge.color!,
          toColor: HIGHLIGHTED_EDGE_COLOR,
        });
        result.push({
          x: edge,
          fromColor: HIGHLIGHTED_EDGE_COLOR,
          toColor: edge.color!,
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
      while (stack[stack.length - 1] !== node.id) {
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
    if (tab === Tabs.SCC) {
      graphData.links.forEach((each) =>
        changeEdgeColor(each, DEFAULT_EDGE_COLOR)
      );
    } else {
      const tmp = { ...tmpGraphData };
      const tmp2 = { ...graphData };
      setTmpGraphData(tmp2);
      setGraphData(tmp);
      setIsDirected(false);
      console.log(tmp2);
    }
  };

  const playNextTransition = (result: ITransitionFrame[], i: number) => {
    if (Array.isArray(result[i].x)) {
      for (let j = 0; j < result[i].x.length; j++) {
        const tmp = result[i].x as IEdge[] | INode[];
        if ('id' in tmp[j]) {
          changeNodeColor(tmp[j] as INode, result[i].toColor);
        } else {
          changeEdgeColor(tmp[j] as IEdge, result[i].toColor);
        }
      }
    } else {
      if ('id' in result[i].x) {
        changeNodeColor(result[i].x as INode, result[i].toColor);
      } else {
        changeEdgeColor(result[i].x as IEdge, result[i].toColor);
      }
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

  const runTarjan = (gData: IGraphData, adjList: number[][]) => {
    setTmpGraphData(gData);
    const MAX = 2e9 + 7;
    const id = [0];

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

  const runHopcroftKarp = (gData: IGraphData, adjList: number[][]) => {
    const { U, V, diff } = getUandVVertices(adjList);
    const tmpAdjList: number[][] = [...Array(U.length + 1)].map(() => []);
    adjList.forEach((each, i) => {
      if (each.length > 0) {
        each.forEach((each_) => tmpAdjList[i + 1].push(each_ - diff + 1));
      }
    });

    const res = hopcroftKarp(U, V, tmpAdjList);

    res.pairU.shift();
    for (let i = 0; i < U.length; i++) res.pairU[i] += diff - 1;

    const newAdjList: number[][] = [...Array(adjList.length)].map(() => []);
    adjList.forEach((each, i) => {
      each.forEach((each_) => {
        if (res.pairU[i] === each_) {
          newAdjList[i].push(each_);
        } else {
          newAdjList[each_].push(i);
        }
      });
    });

    const edgeDict = makeEdgeDict(gData);
    const newGData = genGraphFromObject({ ...newAdjList });

    const maxMatchingEdges: IEdge[] = [];

    for (let i = 0; i < res.pairU.length; i++) {
      maxMatchingEdges.push(edgeDict[i][res.pairU[i]]);
    }

    maxMatchingEdges.forEach((each) => {
      const tmp = newGData.links.find((each_) => each_.name === each.name);
      if (tmp) tmp.color = '#00aaff';
    });

    // setTmpGraphData(newGData);

    runTarjan(newGData, newAdjList);
  };

  const hopcroftKarp = (U: number[], V: number[], adj: number[][]) => {
    const MAX = 2e9 + 7;
    const pairU: number[] = Array(U.length + 1).fill(0);
    const pairV: number[] = Array(V.length + 1).fill(0);
    const dist: number[] = Array(U.length + 1).fill(0);
    let result = 0;

    const bfs = () => {
      const q = [];
      for (let u = 1; u <= U.length; u++) {
        if (pairU[u] === 0) {
          dist[u] = 0;
          q.push(u);
        } else {
          dist[u] = MAX;
        }
      }

      dist[0] = MAX;

      while (q.length > 0) {
        const u = q.shift() as number;
        if (dist[u] < dist[0]) {
          for (const v of adj[u]) {
            if (dist[pairV[v]] === MAX) {
              dist[pairV[v]] = dist[u] + 1;
              q.push(pairV[v]);
            }
          }
        }
      }

      return dist[0] !== MAX;
    };

    const dfs = (u: number) => {
      if (u !== 0) {
        for (const v of adj[u]) {
          if (dist[pairV[v]] === dist[u] + 1) {
            if (dfs(pairV[v])) {
              pairV[v] = u;
              pairU[u] = v;
              return true;
            }
          }
        }

        dist[u] = MAX;
        return false;
      }

      return true;
    };

    while (bfs()) {
      for (let u = 1; u <= U.length; u++) {
        if (pairU[u] === 0 && dfs(u)) {
          result++;
        }
      }
    }

    return { result, pairU };
  };

  useEffect(() => {
    setGraphData({
      nodes: [],
      links: [],
    });
  }, [tab]);

  return (
    <div className=''>
      <h3 className='text-white text-xl mb-3'>Visualisation</h3>
      <div>
        {tab === Tabs.SCC ? (
          <Graph
            graphData={graphData}
            fgRef={
              fgRef as React.MutableRefObject<
                ForceGraphMethods<any, LinkObject<any, IEdge>>
              >
            }
            tarjanCallback={(gData) => {
              const adjList = makeAdjList(gData);
              runTarjan(gData, adjList);
              setGraphData(gData);
            }}
          />
        ) : (
          <Bigraph
            graphData={graphData}
            fgRef={
              fgRef as React.MutableRefObject<
                ForceGraphMethods<any, LinkObject<any, IEdge>>
              >
            }
            tarjanCallback={(gData) => {
              setIsDirected(false);
              const adjList = makeAdjList(gData);
              runHopcroftKarp(gData, adjList);
              setGraphData(gData);
            }}
            isDirected={isDirected}
          />
        )}
      </div>
      <div className='w-full'>
        <div className='w-fit mx-auto'>
          <div className='w-full inline-block'>
            {tab === Tabs.AllDifferent && (
              <Button
                disabled={isDirected}
                onClick={() => {
                  setIsDirected(true);
                  const tmp = { ...tmpGraphData };
                  const tmp2 = { ...graphData };
                  graphData.nodes.forEach((each, i) => {
                    tmp.nodes[i].x = each.x;
                    tmp.nodes[i].y = each.y;
                  });

                  setGraphData(tmp);
                  setTmpGraphData(tmp2);
                  console.log(tmp);
                }}>
                Find max matching
              </Button>
            )}
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
                isRunning === RunStatus.Running ||
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
              Run
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

export default GraphContainer;
