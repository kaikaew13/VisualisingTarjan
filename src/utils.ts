import {
  DEFAULT_EDGE_COLOR,
  DEFAULT_NODE_COLOR,
  GraphType,
  IEdge,
  IGraphData,
  INode,
} from './components/GraphContainer';

// generate random tree for testing purpose
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

// ---- reingold-tilford algorithm for drawing tree graph --------
const D = 50;

const setupTree = (graph: any, vis: boolean[]) => {
  for (let i = 0; i < Object.keys(graph).length; i++) {
    graph[i].id = i;
    graph[i].x = 0;
    graph[i].y = 0;
    graph[i].mod = 0;
    vis.push(false);
  }
};

const removeCycle = (node: any, graph: any, vis: boolean[]) => {
  if (!node) return;
  vis[node.id] = true;
  const tmpChildren: string[] = [];
  node.children.forEach((each: any) => {
    if (!vis[parseInt(each)]) {
      removeCycle(graph[parseInt(each)], graph, vis);
      tmpChildren.push(each);
    }
  });

  node.tmpChildren = tmpChildren;
};

const layoutTree = (node: any, graph: any, depth = 0, nextX = { value: 0 }) => {
  if (!node) {
    return;
  }

  node.y = depth * D;
  if (node.tmpChildren.length === 0) {
    node.x = nextX.value;
    nextX.value += D;
  } else {
    node.tmpChildren.forEach((each: any) => {
      layoutTree(graph[parseInt(each)], graph, depth + 1, nextX);
    });

    resolveConflicts(node, graph);

    const first = graph[parseInt(node.tmpChildren[0])];
    const last = graph[parseInt(node.tmpChildren[node.tmpChildren.length - 1])];
    node.x = (first.x + last.x) / 2;
  }
};

const resolveConflicts = (node: any, graph: any) => {
  let shiftAmount = 0;
  const minDistance = D;

  const leftContour: number[] = [];
  const rightContour: number[] = [];

  getLeftContour(node, graph, 0, leftContour);
  getRightContour(node, graph, 0, rightContour);

  for (let i = 0; i < Math.min(leftContour.length, rightContour.length); i++) {
    let dis = rightContour[i] - leftContour[i];
    if (dis < minDistance) {
      shiftAmount = Math.max(shiftAmount, minDistance - dis);
    }
  }

  if (shiftAmount > 0) {
    node.x += shiftAmount;
    node.mod += shiftAmount;
  }
};

const getLeftContour = (
  node: any,
  graph: any,
  modSum: number,
  contour: number[]
) => {
  if (!node) return;

  const xPos = node.x + modSum;
  if (contour[node.y] === undefined) {
    contour[node.y] = xPos;
  } else {
    contour[node.y] = Math.min(contour[node.y], xPos);
  }

  node.tmpChildren.forEach((each: any) => {
    getLeftContour(graph[parseInt(each)], graph, modSum + node.mod, contour);
  });
};

const getRightContour = (
  node: any,
  graph: any,
  modSum: number,
  contour: number[]
) => {
  if (!node) return;

  const xPos = node.x + modSum;
  if (contour[node.y] === undefined) {
    contour[node.y] = xPos;
  } else {
    contour[node.y] = Math.max(contour[node.y], xPos);
  }

  node.tmpChildren.forEach((each: any) => {
    getRightContour(graph[parseInt(each)], graph, modSum + node.mod, contour);
  });
};

// ---------------------------------------------------------

export const genGraphFromObject = (
  graph: any,
  graphType: GraphType,
  firstRightNodeName = ''
) => {
  if (graphType === GraphType.Tree) {
    const vis: boolean[] = [];
    setupTree(graph, vis);
    removeCycle(graph[0], graph, vis);
    console.log(graph);
    layoutTree(graph[0], graph);
  }

  const nodes: INode[] = [];
  const links: IEdge[] = [];
  let x = -50;
  let y = 0;
  for (let i = 0; i < Object.keys(graph).length; i++) {
    if (graph[i].name === firstRightNodeName) {
      y = 0;
      x = 50;
    }

    nodes.push({
      id: i,
      val: 1,
      name: graph[i].name,
      color: DEFAULT_NODE_COLOR,
      x:
        graphType === GraphType.Regular
          ? undefined
          : graphType === GraphType.Bipartite
          ? x
          : graph[i].x,
      y:
        graphType === GraphType.Regular
          ? undefined
          : graphType === GraphType.Bipartite
          ? y
          : graph[i].y,
      fx:
        graphType === GraphType.Regular
          ? undefined
          : graphType === GraphType.Bipartite
          ? x
          : graph[i].x,
      fy:
        graphType === GraphType.Regular
          ? undefined
          : graphType === GraphType.Bipartite
          ? y
          : graph[i].y,
    });

    graph[i].children.forEach((each: string) =>
      links.push({
        source: i,
        target: parseInt(each),
        name: `${i} -> ${each}`,
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
  fileData: string,
  graphType: GraphType
) => {
  const graph = JSON.parse(fileData);
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
