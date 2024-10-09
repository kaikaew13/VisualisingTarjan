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
  const graph = await (await fetch('./src/example1.json')).json();
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

export const genRandomColor = () => {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
};

export const delay = async (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};

export const makeAdjList = (graphData: IGraphData) => {
  const adjList: number[][] = graphData.nodes.map(() => []);
  graphData.links.forEach((each) => {
    adjList[each.source.id].push(each.target.id);
  });

  return adjList;
};

export const makeEdgeDict = (graphData: IGraphData) => {
  const edgeDict: (IEdge | null)[][] = graphData.nodes.map(() =>
    graphData.nodes.map(() => null)
  );
  graphData.links.forEach((each) => {
    edgeDict[each.source.id][each.target.id] = each;
  });
  return edgeDict as IEdge[][];
};
