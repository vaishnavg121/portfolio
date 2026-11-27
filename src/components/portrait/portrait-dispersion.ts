const noise = (index: number, offset: number) => {
  const seed = Math.sin(index * 62.713 + offset * 91.79) * 43758.5453123;
  return seed - Math.floor(seed);
};

type FringePoint = { x: number; y: number; depth: number; tone: number; opacity: number; radius: number };

export function tracePortraitSilhouette(samples: Uint8Array, size: number, count: number) {
  const compact = size < 100;
  const reach = size * (compact ? .123 : .172);
  const padding = Math.ceil(reach + 2);
  const width = size + padding * 2;
  const records = new Int32Array(width * width).fill(-1);
  const gridCell = (record: number) => (padding + (samples[record + 1] >> 1)) * width + padding + (samples[record] >> 1);

  for (let index = 0; index < count; index++) {
    const record = 6 + index * 5;
    const coverage = samples[record + 3] & 15;
    if (coverage < 3) continue;
    const cell = gridCell(record);
    const previous = records[cell];
    if (previous < 0 || (samples[previous + 3] & 15) < coverage) records[cell] = record;
  }

  // Only open air connects to the outer border. Gaps in the face and glasses stay inside.
  const outside = new Uint8Array(records.length);
  const queue = new Int32Array(records.length);
  let tail = 0;
  const enter = (cell: number) => {
    if (outside[cell] || records[cell] >= 0) return;
    outside[cell] = 1;
    queue[tail++] = cell;
  };
  enter(0);
  for (let head = 0; head < tail; head++) {
    const cell = queue[head], x = cell % width;
    if (x > 0) enter(cell - 1);
    if (x < width - 1) enter(cell + 1);
    if (cell >= width) enter(cell - width);
    if (cell < records.length - width) enter(cell + width);
  }

  const edge = new Uint8Array(count);
  for (let index = 0; index < count; index++) {
    const cell = gridCell(6 + index * 5);
    edge[index] = Number(outside[cell-1] || outside[cell+1] || outside[cell-width] || outside[cell+width]);
  }

  // Propagate each cell's nearest occupied pixel so dispersion can follow its real outline.
  const nearest = new Int32Array(records.length).fill(-1);
  const distances = new Float32Array(records.length).fill(Infinity);
  for (let cell = 0; cell < records.length; cell++) {
    if (records[cell] >= 0) {
      nearest[cell] = cell;
      distances[cell] = 0;
    }
  }
  const check = (cell: number, neighbor: number, x: number, y: number) => {
    const source = nearest[neighbor];
    if (source < 0) return;
    const dx = source % width - x, dy = Math.floor(source / width) - y;
    const distance = dx * dx + dy * dy;
    if (distance >= distances[cell]) return;
    distances[cell] = distance;
    nearest[cell] = source;
  };
  for (const direction of [1, -1]) {
    for (let index = 0; index < records.length; index++) {
      const cell = direction > 0 ? index : records.length - index - 1;
      if (records[cell] >= 0) continue;
      const x = cell % width, y = Math.floor(cell / width);
      if (x - direction >= 0 && x - direction < width) check(cell, cell - direction, x, y);
      if (y - direction < 0 || y - direction >= width) continue;
      check(cell, cell - direction * width, x, y);
      if (x > 0) check(cell, cell - direction * width - 1, x, y);
      if (x < width - 1) check(cell, cell - direction * width + 1, x, y);
    }
  }

  const fringe: FringePoint[] = [];
  const safeEdge = size * (compact ? .018 : .04);
  for (let index = 0; index < tail; index++) {
    const cell = queue[index];
    if (distances[cell] > reach * reach || nearest[cell] < 0) continue;
    const distance = Math.sqrt(distances[cell]);
    const fade = Math.max(0, 1 - distance / reach);
    const x = cell % width - padding, y = Math.floor(cell / width) - padding;
    const grain = .72 + .22 * Math.sin(x * .22 - y * .15) + .07 * Math.cos(y * .43 + x * .19);
    if (noise(cell, 1) > .59 * fade ** .88 * grain) continue;

    const edgeDistance = Math.min(x + safeEdge, y + safeEdge, size + safeEdge - x, size + safeEdge - y);
    const framing = Math.min(1, Math.max(0, edgeDistance / (size * .055)));
    if (framing < .03) continue;
    const source = records[nearest[cell]];
    const tone = (samples[source + 3] >> 4) / 15;
    const outwardX = (x + padding - nearest[cell] % width) / distance;
    const outwardY = (y + padding - Math.floor(nearest[cell] / width)) / distance;
    const lateral = (noise(cell, 4) - .5) * 1.75;
    fringe.push({
      x: x + .5 - outwardY * lateral + (noise(cell, 2) - .5) * .85,
      y: y + .5 + outwardX * lateral + (noise(cell, 3) - .5) * .85 - distance * .06,
      depth: (samples[source + 2] / 255 - .5) * size * .5 - distance * (.30 + noise(cell, 6) * 1.05),
      tone,
      opacity: (.19 + tone * .17 + noise(cell, 7) * .15) * fade ** 1.56 * framing,
      radius: (.12 + noise(cell, 8) * .15) * (.76 + .24 * fade),
    });
  }
  return { edge, fringe };
}
