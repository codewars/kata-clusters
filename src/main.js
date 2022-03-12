import "./style.css";
import { renderStaticForceGraph } from "./graph.js";
import { Computed } from "./types";

import("./data/computed.json").then((json) => {
  const data = Computed.parse(json);
  const nodes = data.nodes.map(([id, name, group, x, y], i) => ({
    id,
    name: name || id,
    group,
    x,
    y,
    index: i,
  }));
  renderStaticForceGraph({
    nodes,
    links: data.links,
    maxX: data.width,
    maxY: data.height,
  });
});
