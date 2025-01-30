import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
} from 'react-force-graph-2d';

import { GraphType, IEdge, IGraphData } from './GraphContainer';
import { useEffect } from 'react';
import { delay, genGraphFromJSON } from '../utils';

interface TreegraphProps {
  graphData: IGraphData;
  fgRef: React.MutableRefObject<ForceGraphMethods<any, LinkObject<any, IEdge>>>;
  tarjanCallback: (gData: IGraphData) => void;
  fileData: string;
}

const Treegraph = ({
  graphData,
  fgRef,
  tarjanCallback,
  fileData,
}: TreegraphProps) => {
  useEffect(() => {
    if (graphData.links.length === 0) {
      (async () => {
        const gData = await genGraphFromJSON(fileData, GraphType.Tree);
        tarjanCallback(gData);
        await delay(0);
      })();
    }
  }, [graphData]);

  return (
    <div className='rounded-lg p-1 bg-twblack'>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        cooldownTime={0}
        height={screen.height * 0.55}
        width={screen.width * 0.5}
        maxZoom={5}
        backgroundColor='#0E0D11'
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
          ctx.fillStyle = '#F8F8F2';
          ctx.fillText(label, node.x, node.y);
        }}
        // link attr
        linkDirectionalArrowLength={8}
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
        // dagMode='td'
        // dagLevelDistance={100}
      />
    </div>
  );
};

export default Treegraph;
