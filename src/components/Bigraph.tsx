import React, { useEffect, useState } from 'react';
import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
} from 'react-force-graph-2d';
import * as d3Force from 'd3-force';

import { GraphType, IEdge, IGraphData } from './GraphContainer';
import { delay, genGraphFromJSON } from '../utils';

interface BigraphProps {
  graphData: IGraphData;
  fgRef: React.MutableRefObject<ForceGraphMethods<any, LinkObject<any, IEdge>>>;
  tarjanCallback: (gData: IGraphData) => void;
  isDirected: boolean;
}

const Bigraph = ({
  graphData,
  fgRef,
  tarjanCallback,
  isDirected,
}: BigraphProps) => {
  useEffect(() => {
    if (graphData.links.length === 0) {
      // setGraphData(genRandomTree(10) as IGraphData);
      // setGraphData(dummyGraph);

      (async () => {
        const gData = await genGraphFromJSON(
          './src/example/example5.json',
          GraphType.Bipartite
        );
        tarjanCallback(gData);
        await delay(0);
      })();
    }
  }, [graphData]);

  return (
    <>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        cooldownTime={0}
        height={screen.height * 0.55}
        width={screen.width * 0.65}
        maxZoom={5}
        backgroundColor='black'
        enablePanInteraction={true}
        autoPauseRedraw
        onEngineStop={() => fgRef!.current!.zoomToFit(500)}
        // node attr
        enableNodeDrag={false}
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
        linkDirectionalArrowLength={isDirected ? 8 : undefined}
        linkDirectionalArrowRelPos={isDirected ? 1 : undefined}
        //   linkCurvature={(link) => {
        //     let cnt = 0;
        //     const tmp = graphData.links;
        //     // self edge
        //     if (link.source === link.target) return 0.8;

        //     for (let i = 0; i < tmp.length; i++) {
        //       if (tmp[i].source === link.source && tmp[i].target === link.target)
        //         cnt++;
        //       if (tmp[i].source === link.target && tmp[i].target === link.source)
        //         cnt++;
        //     }

        //     return cnt === 2 ? 0.1 : 0;
        //   }}
        // dagMode={!isDirected ? 'lr' : undefined}
        // dagLevelDistance={100}
      />
    </>
  );
};

export default Bigraph;
