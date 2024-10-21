import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_NODE_COLOR,
  IEdge,
  IGraphData,
  INode,
} from './components/Graph';

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

export const genGraphFromJSON = async (filename: string) => {
  const graph = await (await fetch('./src/example/example1.json')).json();
  const nodes: INode[] = [];
  const links: IEdge[] = [];
  for (const id in graph) {
    nodes.push({
      id: parseInt(id),
      val: 1,
      name: `node ${id}`,
      color: DEFAULT_NODE_COLOR,
    });

    graph[id].forEach((each: string) =>
      links.push({
        source: parseInt(id),
        target: parseInt(each),
        name: `${id} -> ${each}`,
        color: DEFAULT_EDGE_COLOR,
      })
    );
  }

  return {
    nodes,
    links,
  } as IGraphData;
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
