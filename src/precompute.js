// Run with `node precompute.js` to get `computed.json`
import fs from "node:fs";

import * as d3 from "d3";

import { TAG, KATA, BETA, KATA_RADIUS, TAG_RADIUS } from "./graph.js";
import { Node, KataTagsData, Computed } from "./types.js";

const json = JSON.parse(
  fs.readFileSync(new URL("./data/kata-tags.json", import.meta.url), {
    encoding: "utf8",
  })
);
const data = z.array(KataTagsData).parse(json);
const tags = new Set(data.flatMap((d) => d.tags));
const nodes = [
  ...data.map(({ id, name, approved }, index) => ({
    id,
    name,
    group: approved ? KATA : BETA,
    index,
    x: 0,
    y: 0,
  })),
  ...[...tags]
    .sort()
    .map((id) => ({ id, name: id, group: TAG, index: 0, x: 0, y: 0 })),
].map((d, i) => ((d.index = i), Node.parse(d)));
const nodeById = new Map(nodes.map((d) => [d.id, d]));

const links = data.flatMap(({ id: source, tags }) =>
  tags.map((target) => ({
    source: nodeById.get(source),
    target: nodeById.get(target),
  }))
);

// Counts of links per node
const counts = [];
for (let i = 0; i < nodes.length; ++i) counts[i] = 0;
for (const link of links) {
  counts[link.source.index] += 1;
  counts[link.target.index] += 1;
}

d3.forceSimulation(nodes)
  .force(
    "link",
    d3
      .forceLink(links)
      .id(({ index: i }) => nodes[i].id)
      .distance(5)
      // Reduce strength if the target (tag) is heavily connected like Fundamentals.
      .strength((d) => 1 / Math.log(Math.max(2, counts[d.target.index])))
  )
  // Make nodes repel each other
  .force("charge", d3.forceManyBody().strength(-10))
  // Collision radius distance betwee points to be at least radius(a) + radius(b)
  .force(
    "collide",
    d3.forceCollide((d) => (d.group === TAG ? TAG_RADIUS : KATA_RADIUS))
  )
  .stop()
  .tick(300);

const [min, max] = nodes.reduce(
  (a, d) => {
    if (d.x < a[0][0]) a[0][0] = d.x;
    if (d.y < a[0][1]) a[0][1] = d.y;
    if (d.x > a[1][0]) a[1][0] = d.x;
    if (d.y > a[1][1]) a[1][1] = d.y;
    return a;
  },
  [
    [Infinity, Infinity],
    [-Infinity, -Infinity],
  ]
);
// Translate the top left node to 0,0
const computed = Computed.parse({
  width: Math.round(max[0] - min[0]),
  height: Math.round(max[1] - min[1]),
  // Using array to reduce size
  nodes: nodes.map(({ id, name, group, x, y }) => [
    id,
    name === id ? "" : name,
    group,
    Math.round(x - min[0]),
    Math.round(y - min[1]),
  ]),
  links: links.map((d) => [d.source.index, d.target.index]),
});

fs.writeFileSync(
  new URL("./data/computed.json", import.meta.url),
  JSON.stringify(computed)
);
