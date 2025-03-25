import ForceGraph2D, {
  ForceGraphMethods,
  LinkObject,
} from 'react-force-graph-2d';
import * as d3Force from 'd3-force';

import { GraphType, IEdge, IGraphData } from '../GraphContainer';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { delay, genGraphFromJSON } from '../../utils';
import useSnackbar from '../../hooks/useSnackbar';

interface GraphProps {
  graphData: IGraphData;
  fgRef: React.MutableRefObject<ForceGraphMethods<any, LinkObject<any, IEdge>>>;
  tarjanCallback: (gData: IGraphData) => void;
  fileData: string;
  setFileData: Dispatch<SetStateAction<string>>;
}

const Graph = ({
  graphData,
  fgRef,
  tarjanCallback,
  fileData,
  setFileData,
}: GraphProps) => {
  const [cooldownTime, setCooldownTime] = useState(1000);
  const addSnackbar = useSnackbar();

  useEffect(() => {
    if (graphData.links.length === 0) {
      (async () => {
        try {
          const gData = await genGraphFromJSON(fileData, GraphType.Regular);
          tarjanCallback(gData);
          // runTarjan(gData);
          // setGraphData(gData);
          await delay(cooldownTime);
          setCooldownTime(0);
        } catch (error) {
          addSnackbar({
            key: 'error',
            text: 'Data imported is not in correct format',
            variant: 'error',
          });
          setFileData('');
        }
      })();
    } else {
      const LINK_LENGTH_CONSTANT = 50;
      const fg = fgRef.current!;
      fg.d3Force('charge', d3Force.forceManyBody().strength(-600));
      fg.d3Force('link')!.distance(() => LINK_LENGTH_CONSTANT);
    }
  }, [graphData]);

  return (
    <div className='rounded-lg p-1 bg-twblack-secondary'>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        // cooldownTicks={100}
        cooldownTime={cooldownTime}
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
          // ctx.beginPath();
          // ctx.arc(node.x, node.y, 10 * 1.4, 0, 2 * Math.PI, false);
          // ctx.fillStyle = 'red';
          // ctx.fill();
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
        // dagMode='lr'
        // dagLevelDistance={100}
      />
    </div>
  );
};

export default Graph;
