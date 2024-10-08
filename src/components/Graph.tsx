import { useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { delay, genRandomTree, makeAdjList } from '../utils';
import Button from './Button';

export interface IGraphData {
  nodes: INode[];
  links: IEdge[];
}

export interface IEdge {
  source: any;
  target: any;
  name?: string;
}

export interface INode {
  id: number;
  val?: number;
  name?: string;
  color?: string;
}

const Graph = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [graphData, setGraphData] = useState<IGraphData>({
    nodes: [],
    links: [],
  });

  const changeNodeColor = (node: INode, color: string) => {
    const tmp = { ...graphData };
    tmp.nodes[node.id].color = color;
    setGraphData(tmp);
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
    changeNodeColor(node, '#ffa500');
    await delay(ms);
    for (let i = 0; i < adjList[node.id].length; i++) {
      await dfs(graphData.nodes[adjList[node.id][i]], adjList, vis, ms);
    }

    changeNodeColor(node, '#00ff00');
    await delay(ms);
  };

  const resetGraph = () => {
    const tmp = { ...graphData };
    tmp.nodes.forEach((each) => changeNodeColor(each, '#ff0000'));
  };

  useEffect(() => {
    if (graphData.links.length === 0)
      setGraphData(genRandomTree(20) as IGraphData);
  }, [graphData]);

  return (
    <>
      <div className=' w-full h-[80vh] overflow-hidden'>
        <ForceGraph2D
          graphData={graphData}
          enableNodeDrag={true}
          enablePanInteraction={false}
          nodeRelSize={10}
          nodeCanvasObjectMode={() => 'after'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'black';
            ctx.fillText(label, node.x, node.y);
          }}
        />
      </div>
      <div className='w-full'>
        <Button
          disabled={isRunning}
          onClick={async () => {
            const adjList = makeAdjList(graphData);
            const vis = adjList.map(() => false);
            setIsRunning(true);
            await delay(250);
            await dfs(graphData.nodes[0], adjList, vis, 250);
            setIsRunning(false);
            await delay(250);
          }}>
          {isRunning ? 'Running' : 'Run'}
        </Button>
        <Button disabled={isRunning} onClick={resetGraph}>
          Reset
        </Button>
      </div>
    </>
  );
};

export default Graph;
