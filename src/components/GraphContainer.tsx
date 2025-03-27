import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { ForceGraphMethods, LinkObject } from 'react-force-graph-2d';

import {
  delay,
  genRandomColor,
  makeAdjList,
  makeEdgeDict,
  getUandVVertices,
  genGraphFromObject,
  getFirstRightNodeName,
  getGraphObjFromIGraphData,
  pruneEdges,
  HCC_CASE,
  genGraphFromJSON,
} from '../utils';
import Button from './Button';
import { Tabs } from '../App';
import Graph from './graphs/Graph';
import Bigraph from './graphs/Bigraph';
import { highlightCodeLines } from './Pseudocode';
import { arrow, graph } from '../assets';
import Treegraph from './graphs/Treegraph';

enum RunStatus {
  Incomplete,
  Running,
  Complete,
}

export enum GraphType {
  Regular,
  Bipartite,
  Tree,
}

export const DEFAULT_NODE_COLOR = '#565167';
export const DISCOVERED_NODE_COLOR = '#6272A4';
export const DEFAULT_EDGE_COLOR = '#F8F8F2';
export const HIGHLIGHTED_EDGE_COLOR = '#50FA7B';
export const TW_PINK = '#FF79C6';

export interface ITransitionFrame {
  x: INode | IEdge | null;
  fromColor: string;
  toColor: string;
  code: string;
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

interface GraphContainerProps {
  tab: Tabs;
  setHighlightLines: Dispatch<SetStateAction<string>>;
  fileData: string;
  setFileData: Dispatch<SetStateAction<string>>;
  setResSCCs: React.Dispatch<React.SetStateAction<string[][]>>;
  setResHCC: React.Dispatch<React.SetStateAction<IEdge[][]>>;
  setResAllDiff: React.Dispatch<
    React.SetStateAction<{ [key: string]: string[] }>
  >;
  setShowResult: Dispatch<SetStateAction<boolean>>;
}

const GraphContainer = ({
  tab,
  setHighlightLines,
  fileData,
  setFileData,
  setResSCCs,
  setResHCC,
  setResAllDiff,
  setShowResult,
}: GraphContainerProps) => {
  const fgRef = useRef<ForceGraphMethods<any, LinkObject<any, IEdge>>>();
  const isRunningRef = useRef(RunStatus.Incomplete);
  const [isRunning, setIsRunning] = useState(RunStatus.Incomplete);
  const [graphData, setGraphData] = useState<IGraphData>({
    nodes: [],
    links: [],
  });
  const [transitionFrames, setTransitionFrames] = useState<ITransitionFrame[]>(
    []
  );
  const [transitionFramesIdx, setTransitionFramesIdx] = useState(0);
  const [isGraphDirected, setIsGraphDirected] = useState(false);
  const [isAnimationDone, setIsAnimationDone] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(5);

  // for All-different
  const [graphDataEdgesRemoved, setGraphDataEdgesRemoved] =
    useState<IGraphData>({
      nodes: [],
      links: [],
    });
  const [graphDataMaxMatching, setGraphDataMaxMatching] = useState<IGraphData>({
    nodes: [],
    links: [],
  });

  // for HCC
  const [HCCredundantEdges, setHCCredundantEdges] = useState<IEdge[]>([]);

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
    if (color === 'focus') {
      tmp.nodes[node.id].val = 2;
    } else if (color === 'unfocus') {
      tmp.nodes[node.id].val = 1;
    } else {
      tmp.nodes[node.id].color = color;
    }
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
    result.push({
      x: node,
      fromColor: node.color!,
      toColor: DISCOVERED_NODE_COLOR,
      code: highlightCodeLines.tarjaninit,
    });
    result.push({
      x: node,
      fromColor: 'unfocus',
      toColor: 'focus',
      code: highlightCodeLines.tarjaninit,
    });

    const SCCs = [];
    // for HCC
    node.subtrees = [];
    node.subtreesMap = {};

    order[node.id] = id[0];
    low[node.id] = id[0]++;
    vis[node.id] = true;
    stack.push(node.id);

    for (let i = 0; i < adjList[node.id].length; i++) {
      const j = adjList[node.id][i];
      let edge = edgeDict[node.id][j];
      if (order[j] === -1) {
        result.push({
          x: edge,
          fromColor: edge.color!,
          toColor: HIGHLIGHTED_EDGE_COLOR,
          code: highlightCodeLines.neighborif,
        });
        // result.push({
        //   x: edge,
        //   fromColor: HIGHLIGHTED_EDGE_COLOR,
        //   toColor: edge.color!,
        //   code: highlightCodeLines.neighborif,
        // });

        result.push({
          x: node,
          fromColor: 'focus',
          toColor: 'unfocus',
          code: highlightCodeLines.neighborif,
        });

        // for HCC
        node.subtrees.push([j]);
        gData.nodes[j].parent = node;
        const sccs: number[][] = tarjan(
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

        if (sccs.length > 0) {
          sccs.forEach((each) => {
            if (each.length > 0) {
              SCCs.push(each);
            }
          });
        }

        if (!vis[j]) {
          result.push({
            x: edge,
            fromColor: HIGHLIGHTED_EDGE_COLOR,
            toColor: edge.color!,
            code: highlightCodeLines.neighborafterif,
          });
        }
        low[node.id] = Math.min(low[node.id], low[j]);
        result.push({
          x: node,
          fromColor: 'unfocus',
          toColor: 'focus',
          code: highlightCodeLines.neighborafterif,
        });
      } else if (vis[j]) {
        result.push({
          x: edge,
          fromColor: edge.color!,
          toColor: HIGHLIGHTED_EDGE_COLOR,
          code: highlightCodeLines.neighborelse,
        });
        // result.push({
        //   x: edge,
        //   fromColor: CYCLED_EDGE_COLOR,
        //   toColor: edge.color!,
        //   code: highlightCodeLines.neighborelse,
        // });
        low[node.id] = Math.min(low[node.id], low[j]);
      }
    }

    const scc: number[] = [];
    if (low[node.id] === order[node.id]) {
      const color = genRandomColor();
      result.push({
        x: null,
        fromColor: '',
        toColor: '',
        code: highlightCodeLines.sccif,
      });
      while (stack[stack.length - 1] !== node.id) {
        const i = stack.pop();
        scc.push(i!);
        vis[i!] = false;
        result.push({
          x: gData.nodes[i!],
          fromColor: DISCOVERED_NODE_COLOR,
          toColor: color,
          code: highlightCodeLines.sccwhile,
        });
      }

      scc.push(node.id);
      vis[stack.pop()!] = false;
      result.push({
        x: node,
        fromColor: DISCOVERED_NODE_COLOR,
        toColor: color,
        code: highlightCodeLines.sccend,
      });
    }

    if (scc.length > 0) SCCs.push(scc);

    // if (edge) {
    //   result.push({
    //     x: edge,
    //     fromColor: HIGHLIGHTED_EDGE_COLOR,
    //     toColor: edge.color!,
    //     code: highlightCodeLines.sccnoif,
    //   });
    // } else {

    result.push({
      x: node,
      fromColor: 'focus',
      toColor: 'unfocus',
      code: highlightCodeLines.return,
    });
    result.push({
      x: null,
      fromColor: '',
      toColor: '',
      code: highlightCodeLines.return,
    });
    // }

    // for HCC, find subtree of node
    for (let i = 0; i < node.subtrees.length; i++) {
      const j = node.subtrees[i][0];
      node.subtreesMap[j] = i;
      const tmp: number[] = gData.nodes[j].subtrees.flat();
      for (let k = 0; k < tmp.length; k++) {
        node.subtrees[i].push(tmp[k]);
        node.subtreesMap[tmp[k]] = i;
      }
    }

    console.log(node);

    return SCCs;
  };

  const resetGraph = () => {
    setHighlightLines('');
    setTransitionFramesIdx(0);
    graphData.nodes.forEach((each) => {
      changeNodeColor(each, DEFAULT_NODE_COLOR);
      changeNodeColor(each, 'unfocus');
    });
    graphData.links.forEach((each) => {
      if (each.color !== DEFAULT_EDGE_COLOR)
        changeEdgeColor(each, DEFAULT_EDGE_COLOR);
    });
    if (tab === Tabs.AllDifferent) {
      const tmp = { ...graphDataMaxMatching };
      const tmp2 = { ...graphData };
      const tmp3 = { ...graphDataEdgesRemoved };
      setGraphDataMaxMatching(tmp3);
      setGraphData(tmp);
      setGraphDataEdgesRemoved(tmp2);
      setIsGraphDirected(false);
      setIsAnimationDone(false);
    }
    if (tab === Tabs.Hamiltonian) {
      setIsAnimationDone(false);
    }
    setIsRunning(RunStatus.Incomplete);
    isRunningRef.current = RunStatus.Incomplete;
  };

  const playNextTransition = (result: ITransitionFrame[], i: number) => {
    if (result[i].x) {
      if ('id' in result[i].x!) {
        changeNodeColor(result[i].x as INode, result[i].toColor);
      } else {
        changeEdgeColor(result[i].x as IEdge, result[i].toColor);
      }
    }

    setHighlightLines(result[i].code);

    setTransitionFramesIdx(i + 1);
  };

  const playPrevTransition = (result: ITransitionFrame[], i: number) => {
    i--;

    if (result[i].x) {
      if ('id' in result[i].x!) {
        changeNodeColor(result[i].x as INode, result[i].fromColor);
      } else {
        changeEdgeColor(result[i].x as IEdge, result[i].fromColor);
      }
    }

    setHighlightLines(result[i].code);

    setTransitionFramesIdx(i);
  };

  const playTransitionToEnd = async (
    result: ITransitionFrame[],
    ms: number,
    i: number
  ) => {
    for (let j = i; j < result.length; j++) {
      if (isRunningRef.current === RunStatus.Incomplete) {
        return;
      }

      playNextTransition(result, j);
      await delay(ms);
    }

    isRunningRef.current = RunStatus.Complete;
    setIsRunning(RunStatus.Complete);
    setShowResult(true);
    // setIsRunning({ status: RunStatus.Complete });
  };

  const runTarjan = (gData: IGraphData, adjList: number[][]) => {
    const MAX = 2e9 + 7;
    const id = [0];
    const edgeDict = makeEdgeDict(gData);

    const order = adjList.map(() => -1);
    const low = adjList.map(() => MAX);
    const vis = adjList.map(() => false);
    const stack: number[] = [];
    const result: ITransitionFrame[] = [];

    const SCCs: number[][] = [];

    for (let i = 0; i < adjList.length; i++) {
      if (order[gData.nodes[i].id] === -1) {
        result.push({
          x: gData.nodes[i],
          fromColor: gData.nodes[i].color!,
          toColor: DISCOVERED_NODE_COLOR,
          code: highlightCodeLines.mainloop,
        });
        const sccs = tarjan(
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

        if (sccs.length > 0) {
          sccs.forEach((each: number[]) => SCCs.push(each));
        }
      }
    }

    // for HCC
    if (tab === Tabs.Hamiltonian) {
      const edgesToRemove: { edge: IEdge; case: number }[] = [];
      pruneEdges(edgesToRemove, gData, adjList, edgeDict);
      setHCCredundantEdges(edgesToRemove.map((each) => each.edge));

      const tmp: IEdge[][] = [[], [], [], []];
      edgesToRemove.forEach((each) => {
        tmp[each.case].push(each.edge);
      });

      setResHCC(tmp);
    }

    // passing result to Result block
    setTransitionFrames(result);
    const res: string[][] = [];
    SCCs.forEach((each) => {
      const tmp: string[] = [];
      each.forEach((e) => {
        tmp.push(gData.nodes[e].name!);
      });
      res.push(tmp);
    });

    setResSCCs(res);

    return SCCs;
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
          newAdjList[each_].push(i);
        } else {
          newAdjList[i].push(each_);
        }
      });
    });

    const graphObj = getGraphObjFromIGraphData(gData, adjList);
    const newGraphObj = getGraphObjFromIGraphData(gData, newAdjList);

    const newGData = genGraphFromObject(
      newGraphObj,
      GraphType.Bipartite,
      getFirstRightNodeName(graphObj)
    );
    const edgeDict = makeEdgeDict(newGData);

    const maxMatchingEdges: IEdge[] = [];

    for (let i = 0; i < res.pairU.length; i++) {
      maxMatchingEdges.push(edgeDict[res.pairU[i]][i]);
    }

    const resAllDiff: { [key: string]: string[] } = {};

    U.forEach((each) => {
      resAllDiff[newGData.nodes[each].name!] = [];
    });

    maxMatchingEdges.forEach((each) => {
      if (each) {
        resAllDiff[newGData.nodes[each.target].name!].push(
          newGData.nodes[each.source].name!
        );
        const tmp = newGData.links.find((each_) => each_.name === each.name);
        if (tmp) tmp.color = TW_PINK;
      }
    });

    setGraphDataMaxMatching(newGData);
    const SCCs = runTarjan(newGData, newAdjList);
    const edgesToRemove: IEdge[] = [];

    SCCs.forEach((scc) => {
      if (scc.length > 1) {
        for (let i = 0; i < scc.length; i += 2) {
          resAllDiff[newGData.nodes[scc[i]].name!] = [];
          for (let j = 1; j < scc.length; j += 2) {
            resAllDiff[newGData.nodes[scc[i]].name!].push(
              newGData.nodes[scc[j]].name!
            );
          }
        }
      }
    });

    setResAllDiff(resAllDiff);

    newGData.links.forEach((each) => {
      const targetId = each.target;
      const sourceId = each.source;

      const i = SCCs.findIndex((each_) => each_.includes(targetId));

      if (SCCs[i].findIndex((each_) => each_ === sourceId) === -1) {
        if (
          maxMatchingEdges.findIndex(
            (each_) => each_ && each_.name === each.name
          ) === -1
        ) {
          edgesToRemove.push(each);
        }
      }
    });

    // edgesToRemove.forEach((each) => {
    //   const tmp = newGData.links.find((each_) => each_.name === each.name);
    //   if (tmp) tmp.color = '#ff0000';
    // });

    const gDataEdgesRemoved = { ...newGData };
    gDataEdgesRemoved.links = [];
    newGData.links.forEach((each) => {
      if (edgesToRemove.findIndex((each_) => each_.name === each.name) === -1)
        gDataEdgesRemoved.links.push(each);
    });

    setGraphDataEdgesRemoved(gDataEdgesRemoved);
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
    if (fileData === '') {
      setGraphData({
        nodes: [],
        links: [],
      });
      setTransitionFramesIdx(0);
      setTransitionFrames([]);
      setHighlightLines('');
      setIsAnimationDone(false);
      setIsRunning(RunStatus.Incomplete);
      isRunningRef.current = RunStatus.Incomplete;
    }

    if (tab === Tabs.AllDifferent) {
      setIsGraphDirected(false);
    }
  }, [fileData]);

  useEffect(() => {
    setGraphData({
      nodes: [],
      links: [],
    });
    setTransitionFramesIdx(0);
    setTransitionFrames([]);
    setHighlightLines('');
    setIsAnimationDone(false);
    setIsRunning(RunStatus.Incomplete);
    isRunningRef.current = RunStatus.Incomplete;
  }, [tab]);

  return (
    <div className='mx-4'>
      <span className='flex flex-row m-0 p-0'>
        <img src={graph} alt='' className='h-7 w-7 mr-2' />
        <h3 className='text-twwhite text-xl font-poppins font-medium mb-3'>
          Visualisation
        </h3>
      </span>
      <div>
        {fileData === '' ? (
          <>
            <div className='bg-twblack-secondary w-[720px] h-[500px] rounded-lg text-center flex flex-col items-center justify-center'>
              <h3 className='text-3xl font-poppins font-semibold text-twwhite-secondary '>
                No Data Imported
              </h3>
              <div
                className='mt-4 flex flex-row hover:cursor-pointer'
                onClick={async () => {
                  let filename = 'basic1';
                  if (tab === Tabs.AllDifferent) {
                    filename = 'alldifferent3';
                  } else if (tab === Tabs.Hamiltonian) {
                    filename = 'hamiltonian2';
                  }

                  const res = await fetch(`./src/examples/${filename}.json`);
                  const data = await res.text();
                  setFileData(data);
                }}>
                <h6 className=' text-base font-poppins font-medium text-twwhite-secondary underline '>
                  Try example graph
                </h6>
                <img src={arrow} alt='' className='h-6' />
              </div>
            </div>
          </>
        ) : tab === Tabs.SCC ? (
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
            fileData={fileData}
            setFileData={setFileData}
          />
        ) : tab === Tabs.AllDifferent ? (
          <Bigraph
            graphData={graphData}
            fgRef={
              fgRef as React.MutableRefObject<
                ForceGraphMethods<any, LinkObject<any, IEdge>>
              >
            }
            tarjanCallback={(gData) => {
              setIsGraphDirected(false);
              const adjList = makeAdjList(gData);
              runHopcroftKarp(gData, adjList);
              setGraphData(gData);
            }}
            isDirected={isGraphDirected}
            fileData={fileData}
            setFileData={setFileData}
          />
        ) : (
          <Treegraph
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
            fileData={fileData}
            setFileData={setFileData}
          />
        )}
      </div>
      <div className='w-full'>
        <div className='w-fit mx-auto mt-4'>
          <div className='w-full inline-block'>
            {tab === Tabs.AllDifferent ? (
              <>
                <span className='mr-4'>
                  <Button
                    disabled={
                      (isGraphDirected &&
                        transitionFramesIdx !== transitionFrames.length) ||
                      fileData === '' ||
                      isAnimationDone
                    }
                    onClick={() => {
                      if (!isGraphDirected) {
                        setIsGraphDirected(true);
                        const tmp = { ...graphDataMaxMatching };
                        const tmp2 = { ...graphData };
                        graphData.nodes.forEach((each, i) => {
                          tmp.nodes[i].x = each.x;
                          tmp.nodes[i].y = each.y;
                        });

                        setGraphData(tmp);
                        setGraphDataMaxMatching(tmp2);
                      } else {
                        const tmp = { ...graphDataEdgesRemoved };
                        const tmp2 = { ...graphData };
                        graphData.nodes.forEach((each, i) => {
                          tmp.nodes[i].x = each.x;
                          tmp.nodes[i].y = each.y;
                        });

                        setGraphData(tmp);
                        setGraphDataEdgesRemoved(tmp2);
                        setIsAnimationDone(true);
                      }
                    }}>
                    {!isGraphDirected
                      ? 'Find max matching'
                      : 'Remove redundant edges'}
                  </Button>
                </span>
              </>
            ) : (
              tab === Tabs.Hamiltonian && (
                <>
                  <span className='mr-4'>
                    <Button
                      disabled={
                        // (isGraphDirected &&
                        transitionFramesIdx !== transitionFrames.length ||
                        fileData === '' ||
                        isAnimationDone
                      }
                      onClick={() => {
                        HCCredundantEdges.forEach((each) =>
                          changeEdgeColor(each, TW_PINK)
                        );
                        setIsAnimationDone(true);
                      }}>
                      Highlight redundant edges
                    </Button>
                  </span>
                </>
              )
            )}

            <span className='mr-4'>
              <Button
                disabled={
                  (tab === Tabs.AllDifferent && !isGraphDirected) ||
                  isRunning === RunStatus.Running ||
                  transitionFramesIdx === 0 ||
                  isAnimationDone ||
                  fileData === ''
                }
                onClick={async () => {
                  await playPrevTransition(
                    transitionFrames,
                    transitionFramesIdx
                  );

                  if (1 === transitionFramesIdx) {
                    isRunningRef.current = RunStatus.Incomplete;
                    setIsRunning(RunStatus.Incomplete);
                    // setIsRunning({ status: RunStatus.Incomplete });
                  }
                }}>
                Prev
              </Button>
            </span>
            <span className='mr-4'>
              <Button
                disabled={
                  (tab === Tabs.AllDifferent && !isGraphDirected) ||
                  transitionFramesIdx === transitionFrames.length ||
                  fileData === ''
                }
                onClick={async () => {
                  if (isRunningRef.current === RunStatus.Running) {
                    isRunningRef.current = RunStatus.Incomplete;
                    setIsRunning(RunStatus.Incomplete);
                  } else {
                    isRunningRef.current = RunStatus.Running;
                    setIsRunning(RunStatus.Running);
                    playTransitionToEnd(
                      transitionFrames,
                      1000 / animationSpeed,
                      transitionFramesIdx
                    );
                  }
                }}>
                {isRunning === RunStatus.Running ? 'Stop' : 'Run'}
              </Button>
            </span>
            <Button
              disabled={
                (tab === Tabs.AllDifferent && !isGraphDirected) ||
                isRunning === RunStatus.Running ||
                transitionFramesIdx === transitionFrames.length ||
                fileData === ''
              }
              onClick={async () => {
                await playNextTransition(transitionFrames, transitionFramesIdx);

                if (transitionFramesIdx === transitionFrames.length - 1) {
                  isRunningRef.current = RunStatus.Complete;
                  setIsRunning(RunStatus.Complete);
                  setShowResult(true);
                  // setIsRunning({ status: RunStatus.Complete });
                }
              }}>
              Next
            </Button>
          </div>
        </div>
        <div className='w-fit mx-auto flex flex-row items-center mt-4'>
          <Button
            disabled={isRunning === RunStatus.Running || fileData === ''}
            onClick={() => {
              resetGraph();
              isRunningRef.current = RunStatus.Incomplete;
              setIsRunning(RunStatus.Incomplete);
              // setIsRunning({ status: RunStatus.Incomplete });
            }}>
            Reset
          </Button>
          <div className='mx-4'>
            <p className='text-twwhite font-poppins font-medium text-sm'>
              Animation Speed
            </p>
            <input
              disabled={isRunning === RunStatus.Running}
              className=' accent-twpink disabled:cursor-not-allowed'
              type='range'
              min='1'
              max='10'
              value={animationSpeed}
              onChange={(val) => setAnimationSpeed(parseInt(val.target.value))}
            />
          </div>
          <Button
            disabled={fileData === '' || isRunning === RunStatus.Running}
            onClick={() => {
              setFileData('');
            }}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GraphContainer;
