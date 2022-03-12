import * as d3 from "d3";
import { GraphOptions } from "./types";

export const TAG = 1;
export const KATA = 2;
export const BETA = 3;

export const TAG_RADIUS = 6;
export const KATA_RADIUS = 4;

const BG_COLOR = "#18181B";

const nodeTitle = (d) => (d.group === TAG ? d.id : d.name);

export function renderStaticForceGraph(options) {
  const { nodes, links, maxX, maxY } = GraphOptions.parse(options);
  // Quadtree used to find nodes from event.
  // Note that if we decide to add support for dragging nodes,
  // the moved node must be removed from the quadtree and readded.
  const qtree = d3.quadtree(
    nodes,
    (d) => d.x,
    (d) => d.y
  );
  /**
   * Sets of nodes each node is linked to for looking up related nodes.
   * @type {Set<number>[]} */
  const linkSets = [];
  for (let i = 0; i < nodes.length; ++i) linkSets[i] = new Set();
  for (const [a, b] of links) linkSets[a].add(b);
  /**
   * When not `null`, only show the connected nodes from this one.
   * @type {typeof import("./types").Node.shape | null} */
  let clickedNode = null;
  /**
   * Index of selected nodes
   * @type {Set<number>} */
  const selectedNodes = new Set();
  /**
   * Hovered node
   * @type {typeof import("./types").Node.shape | null} */
  let hoveredNode = null;
  // Color based on group
  const color = d3.scaleOrdinal(
    d3.sort(nodes.map((d) => d.group)),
    d3.schemeTableau10
  );

  let transform = d3.zoomIdentity;

  const zoom = zoomBehavior();
  // Event handlers
  const selection = d3
    .select("#canvas")
    .call(zoom)
    .on("mousemove", debounce(onMousemove, 100))
    .on("click", onClick)
    .on("auxclick", onAuxclick);
  document.addEventListener("keydown", onEscapeKey);
  window.addEventListener("resize", debounce(fillViewport, 500));
  /** @type {HTMLCanvasElement} */
  const canvas = selection.node();
  const context = canvas.getContext("2d");
  // Fit to view and render.
  fillViewport();

  function fitToView() {
    const scale = Math.min(canvas.width / maxX, canvas.height / maxY) * 0.8;
    const [tx, ty] = [
      (canvas.width - scale * maxX) / 2,
      (canvas.height - scale * maxY) / 2,
    ];
    selection
      .transition()
      .duration(250)
      .call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  // Make canvas fill viewport
  function fillViewport() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = canvas.width;
    canvas.style.height = canvas.height;
    fitToView();
  }

  function zoomBehavior() {
    return d3
      .zoom()
      .scaleExtent([1 / 8, 4])
      .on(
        "zoom",
        debounce((event) => {
          transform = event.transform;
          ticked();
        }, 50)
      );
  }

  function isInView(p) {
    const w = context.canvas.width;
    const h = context.canvas.height;
    const [x, y] = transform.apply([p.x, p.y]);
    return x >= 0 && x <= w && y >= 0 && y <= h;
  }

  function ticked() {
    context.save();
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = BG_COLOR;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.translate(transform.x, transform.y);
    context.scale(transform.k, transform.k);

    context.beginPath();
    context.lineCap = "round";
    context.strokeStyle = "rgba(113, 113, 122, 0.2)";
    links.forEach(([a, b]) => {
      // Skip links with both source and target outside of view
      const source = nodes[a];
      const target = nodes[b];
      if (!isInView(source) && !isInView(target)) return;

      if (clickedNode) {
        if (source.id !== clickedNode.id && target.id != clickedNode.id) return;
        // Select tag nodes to be rendered. All links are from kata to tag.
        selectedNodes.add(target.index);
      }
      context.moveTo(source.x, source.y);
      context.lineTo(target.x, target.y);
    });
    context.stroke();

    nodes.forEach((d) => {
      if (!isInView(d)) return;
      if (!shouldShowNode(d)) return;

      context.beginPath();
      const radius = d.group === TAG ? TAG_RADIUS : KATA_RADIUS;
      context.moveTo(d.x + radius, d.y);
      context.arc(d.x, d.y, radius, 0, 2 * Math.PI);
      const c = d3.color(color(d.group));
      context.fillStyle = c;
      context.fill();
      context.strokeStyle =
        hoveredNode?.index === d.index ? c.brighter() : c.darker();
      context.stroke();
    });

    if (hoveredNode) {
      // Show the title on hover
      const fontSize = Math.max(Math.round(16 / transform.k), 1);
      drawText(
        nodeTitle(hoveredNode),
        hoveredNode.x + 8,
        hoveredNode.y,
        fontSize,
        d3.color(color(hoveredNode.group))
      );
    }
    context.restore();
  }

  // Draw text with background
  function drawText(text, x, y, fontSize, fontColor) {
    context.save();
    context.font = `${fontSize}px sans-serif`;
    context.textBaseline = "middle";
    context.fillStyle = BG_COLOR;
    const padding = fontSize / 4;
    const width = context.measureText(text).width + padding;
    const height = fontSize + padding;
    // TODO Adjust position if the title doesn't fit in the view
    context.fillRect(
      x - padding / 2,
      y - height / 2 - padding / 2,
      width,
      height
    );
    context.fillStyle = fontColor;
    context.fillText(text, x, y);
    context.restore();
  }

  function nodeFromEvent(event) {
    const [x, y] = transform.invert(d3.pointer(event));
    return qtree.find(x, y, 200);
  }

  // Filter by clicked node
  function ignoreFiltered(node) {
    if (clickedNode) {
      return node && !selectedNodes.has(node.index) ? null : node;
    } else {
      return node;
    }
  }

  // When a node was clicked, only show connected nodes
  function shouldShowNode(node) {
    if (!clickedNode) return true;
    if (selectedNodes.has(node.index)) return true;

    if (
      node.index !== clickedNode.index &&
      !linkSets[node.index].has(clickedNode.index)
    ) {
      return false;
    }

    selectedNodes.add(node.index);
    return true;
  }

  function changeClickedNode(node) {
    clickedNode = node;
    selectedNodes.clear();
    ticked();
  }

  function onClick(event) {
    const clicked = ignoreFiltered(nodeFromEvent(event));
    if (!clicked) return;

    // Open kata on Ctrl/Cmd+Click
    if (clicked.group !== TAG && (event.ctrlKey || event.metaKey)) {
      return openKata(clicked.id);
    }

    changeClickedNode(clickedNode === clicked ? null : clicked);
  }

  // Open kata on middle click
  function onAuxclick(event) {
    const clicked = ignoreFiltered(nodeFromEvent(event));
    if (clicked.group !== TAG) openKata(clicked.id);
  }

  function openKata(id) {
    window.open(`https://www.codewars.com/kata/${id}`, "_blank");
  }

  function onEscapeKey(event) {
    if (event.key === "Escape") {
      if (clickedNode) {
        clickedNode = null;
        selectedNodes.clear();
        ticked();
      }
    }
  }

  function onMousemove(event) {
    const newCloseNode = ignoreFiltered(nodeFromEvent(event));
    if (newCloseNode) {
      if (hoveredNode !== newCloseNode) {
        hoveredNode = newCloseNode;
        ticked();
      }
      canvas.style.cursor = "pointer";
    } else {
      canvas.style.cursor = "move";
      if (hoveredNode != null) {
        hoveredNode = null;
        ticked();
      }
    }
  }
}

function debounce(fn, delay) {
  let timeout = null;
  let args;
  let self;
  return function debounced() {
    self = this;
    args = Array.prototype.slice.call(arguments);
    // cancel any previous
    clear();
    // run after delay
    timeout = setTimeout(run, delay);
    return timeout;

    function run() {
      clear();
      fn.apply(self, args);
    }

    function clear() {
      clearTimeout(timeout);
      timeout = null;
    }
  };
}
