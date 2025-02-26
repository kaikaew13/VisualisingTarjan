import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
} from 'react-force-graph-2d';

import { GraphType, IEdge, IGraphData } from '../GraphContainer';
import { useEffect, useState } from 'react';
import {
  delay,
  genGraphFromJSON,
  genGraphFromObject,
  removeCycle,
  setupTree,
} from '../../utils';

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
  const [tmpGraph, setTmpGraph] = useState<IGraphData>({
    nodes: [],
    links: [],
  });

  useEffect(() => {
    if (graphData.links.length === 0) {
      (async () => {
        const gData = await genGraphFromJSON(fileData, GraphType.Tree);
        createTmpGraph();
        tarjanCallback(gData);
        await delay(0);
      })();
    }
  }, [graphData]);

  const createTmpGraph = () => {
    const tmp = JSON.parse(fileData);
    const vis: boolean[] = [];
    setupTree(tmp, vis);
    removeCycle(tmp[0], tmp, vis);
    for (let i = 0; i < Object.keys(tmp).length; i++) {
      tmp[i].children = tmp[i].tmpChildren;
    }

    setTmpGraph(genGraphFromObject(tmp, GraphType.Tree));
  };

  return (
    <div className='rounded-lg p-1 bg-twblack-secondary'>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        cooldownTime={0}
        height={screen.height * 0.55}
        width={screen.width * 0.5}
        maxZoom={5}
        backgroundColor='#1D1B22'
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
          let tmp = graphData.links;

          // self edge
          if (link.source === link.target) return 0.8;

          //   2-node cycle
          for (let i = 0; i < tmp.length; i++) {
            if (tmp[i].source === link.source && tmp[i].target === link.target)
              cnt++;
            if (tmp[i].source === link.target && tmp[i].target === link.source)
              cnt++;
          }

          let cnt2 = 0;
          tmp = tmpGraph.links;

          for (let i = 0; i < tmp.length; i++) {
            if (
              tmp[i].source === link.source.id &&
              tmp[i].target === link.target.id
            ) {
              cnt2++;
            }
          }

          return cnt === 2 ? 0.1 : cnt2 === 0 ? 0.2 : 0;
        }}
        // dagMode='td'
        // dagLevelDistance={100}
      />
    </div>
  );
};

export default Treegraph;
