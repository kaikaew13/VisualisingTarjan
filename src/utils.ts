import { IGraphData } from './components/Graph';

export const genRandomTree = (n = 10) => {
  return {
    nodes: [...Array(n).keys()].map((i) => ({
      id: i,
      val: 1,
      name: `node${i}`,
      color: '#ff0000',
    })),
    links: [...Array(n).keys()]
      .filter((id) => id)
      .map((id) => ({
        source: Math.round(Math.random() * (id - 1)),
        target: id,
        name: `link${id}`,
        color: '#ccc',
      })),
  };
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
