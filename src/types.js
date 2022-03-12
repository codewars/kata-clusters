import { z } from "zod";

export const KataTagsData = z.object({
  id: z.string(),
  name: z.string(),
  approved: z.boolean(),
  tags: z.array(z.string()),
});

export const Node = z.object({
  id: z.string(),
  name: z.string(),
  group: z.number(),
  index: z.number(),
  // Position is updated by the simulation.
  x: z.number(),
  y: z.number(),
});

// Precomputed node positions and links.
export const Computed = z.object({
  // max x
  width: z.number().int(),
  // max y
  height: z.number().int(),
  // array of nodes (kata + tags)
  nodes: z.array(
    z.tuple([
      // id
      z.string(),
      // name or empty string
      z.string(),
      // group
      z.number().int(),
      // x
      z.number().int(),
      // y
      z.number().int(),
    ])
  ),
  // array of pairs `[source node index, target node index]`
  links: z.array(z.tuple([z.number().int(), z.number().int()])),
});

export const GraphOptions = z.object({
  // Nodes (kata + tags)
  nodes: z.array(Node),
  // Link described by array of pairs `[source node index, target node index]`
  links: z.array(z.tuple([z.number().int(), z.number().int()])),
  // Max x in node positions
  maxX: z.number(),
  // Max y in node positions
  maxY: z.number(),
});
