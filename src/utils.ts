export const genRandomTree = (N = 10) => {
  return {
    nodes: [...Array(N).keys()].map((i) => ({
      id: i,
      val: 1,
      name: `node${i}`,
      color: '#ff0000',
    })),
    links: [...Array(N).keys()]
      .filter((id) => id)
      .map((id) => ({
        source: id,
        target: Math.round(Math.random() * (id - 1)),
        name: `link${id}`,
        color: '#ccc',
      })),
  };
};

export const delay = async (ms: number) => {
  return new Promise((res) => setTimeout(res, ms));
};
