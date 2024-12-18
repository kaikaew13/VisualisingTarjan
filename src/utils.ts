import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_NODE_COLOR,
  GraphType,
  IEdge,
  IGraphData,
  INode,
} from './components/GraphContainer';

export const genRandomTree = (n = 10) => {
  return {
    nodes: [...Array(n).keys()].map((i) => ({
      id: i,
      val: 1,
      name: `node${i}`,
      color: DEFAULT_NODE_COLOR,
    })),
    links: [...Array(n).keys()]
      .filter((id) => id)
      .map((id) => {
        const source = Math.round(Math.random() * (id - 1));
        return {
          source: source,
          target: id,
          name: `${source} -> ${id}`,
          color: DEFAULT_EDGE_COLOR,
        };
      }),
  };
};

export const genGraphFromObject = (
  graph: any,
  graphType: GraphType,
  firstRightNodeName = ''
) => {
  const nodes: INode[] = [];
  const links: IEdge[] = [];
  let x = -50;
  let y = 0;
  for (const id in graph) {
    if (graph[id].name === firstRightNodeName) {
      y = 0;
      x = 50;
    }

    nodes.push({
      id: parseInt(id),
      val: 1,
      name: graph[id].name,
      color: DEFAULT_NODE_COLOR,
      x: graphType === GraphType.Regular ? undefined : x,
      y: graphType === GraphType.Regular ? undefined : y,
      fx: graphType === GraphType.Regular ? undefined : x,
      fy: graphType === GraphType.Regular ? undefined : y,
    });

    graph[id].children.forEach((each: string) =>
      links.push({
        source: parseInt(id),
        target: parseInt(each),
        name: `${id} -> ${each}`,
        color: DEFAULT_EDGE_COLOR,
      })
    );
    y += 50;
  }

  return {
    nodes,
    links,
  } as IGraphData;
};

export const genGraphFromJSON = async (
  filename: string,
  graphType: GraphType
) => {
  const graph = await (await fetch(filename)).json();
  return genGraphFromObject(graph, graphType, getFirstRightNodeName(graph));
};

let n = Math.floor(Math.random() * 300) + 1;
const MAX_N = 300;
export const genRandomColor = () => {
  const rgb = [0, 0, 0];
  let t = n;
  n = (n + 1) % MAX_N;
  for (let i = 0; i < 24; i++) {
    rgb[i % 3] <<= 1;
    rgb[i % 3] |= t & 0x01;
    t >>= 1;
  }

  return (
    '#' +
    rgb.reduce(
      (a, c) => (c > 0x0f ? c.toString(16) : '0' + c.toString(16)) + a,
      ''
    )
  );
  //   return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};
export const delay = async (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};

export const makeAdjList = (graphData: IGraphData) => {
  const adjList: number[][] = graphData.nodes.map(() => []);

  graphData.links.forEach((each) => {
    if (each.source.id !== undefined) {
      adjList[each.source.id].push(each.target.id);
    } else {
      adjList[each.source].push(each.target);
    }
  });

  return adjList;
};

export const makeEdgeDict = (graphData: IGraphData) => {
  const edgeDict: (IEdge | null)[][] = graphData.nodes.map(() =>
    graphData.nodes.map(() => null)
  );
  graphData.links.forEach((each) => {
    if (each.source.id !== undefined) {
      edgeDict[each.source.id][each.target.id] = each;
    } else {
      edgeDict[each.source][each.target] = each;
    }
  });

  return edgeDict as IEdge[][];
};

export const getFirstRightNodeName = (graph: any) => {
  for (const id in graph) {
    if (graph[id].children.length === 0) {
      return graph[id].name;
    }
  }
  return '';
};

export const getGraphObjFromIGraphData = (
  graphData: IGraphData,
  adjList: number[][]
) => {
  const tmp: { name: string; children: string[] }[] = [
    ...Array(adjList.length),
  ].map(() => {
    return {
      name: '',
      children: [],
    };
  });

  for (let i = 0; i < adjList.length; i++) {
    tmp[i].name = graphData.nodes[i].name!;
    adjList[i].forEach((each) => tmp[i].children.push(`${each}`));
  }

  return tmp as any;
};

export const getUandVVertices = (adjList: number[][]) => {
  const U: number[] = [];
  const V: number[] = [];
  adjList.forEach((each, i) => {
    if (each.length === 0) {
      V.push(i);
    } else {
      U.push(i);
    }
  });

  const diff = Math.min(...V);

  for (let i = 0; i < V.length; i++) V[i] -= diff;
  return { U, V, diff };
};
