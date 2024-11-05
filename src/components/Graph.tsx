import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
} from 'react-force-graph-2d';
import * as d3Force from 'd3-force';

import { IEdge, IGraphData } from './GraphContainer';
import { useEffect, useState } from 'react';
import { delay, genGraphFromJSON } from '../utils';

interface GraphProps {
  graphData: IGraphData;
  adjList: number[][];
  fgRef: React.MutableRefObject<ForceGraphMethods<any, LinkObject<any, IEdge>>>;
  tarjanCallback: (gData: IGraphData) => void;
}

const Graph = ({ graphData, adjList, fgRef, tarjanCallback }: GraphProps) => {
  const [cooldownTime, setCooldownTime] = useState(1500);

  useEffect(() => {
    if (graphData.links.length === 0) {
      (async () => {
        const gData = await genGraphFromJSON('./src/example/example1.json');
        tarjanCallback(gData);
        // runTarjan(gData);
        // setGraphData(gData);
        await delay(cooldownTime);
        setCooldownTime(0);
      })();
    } else {
      const LINK_LENGTH_CONSTANT = 50;
      const fg = fgRef.current!;
      fg.d3Force('charge', d3Force.forceManyBody().strength(-250));
      fg.d3Force('link')!.distance(() => LINK_LENGTH_CONSTANT);
    }
  }, [graphData, adjList]);

  return (
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
      onEngineStop={() => fgRef!.current!.zoomToFit(500)}
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
          if (tmp[i].source === link.source && tmp[i].target === link.target)
            cnt++;
          if (tmp[i].source === link.target && tmp[i].target === link.source)
            cnt++;
        }

        return cnt === 2 ? 0.1 : 0;
      }}
      // dagMode='lr'
      // dagLevelDistance={100}
    />
  );
};

export default Graph;
