const noise = (index: number, offset: number) => {
  const seed = Math.sin(index * 62.713 + offset * 91.79) * 43758.5453123;
  return seed - Math.floor(seed);
};

type FringePoint = {
  x: number; y: number; depth: number;
  tone: number; opacity: number; radius: number;
  flowX: number; flowY: number; mobility: number;
};

// Position and outward heading select a contour arc. Length, bend and spread shape its trail.
const streams = [
  { x: .76, y: .20, dx: .84, dy: -.54, length: .31, bend: .105, spread: .033, weight: 1, depth: -.18 },
  { x: .78, y: .40, dx: .96, dy: -.28, length: .25, bend: -.087, spread: .027, weight: .66, depth: .11 },
  { x: .81, y: .68, dx: .97, dy: .24, length: .31, bend: .125, spread: .041, weight: 1, depth: .19 },
  { x: .16, y: .63, dx: -.88, dy: -.47, length: .22, bend: .085, spread: .039, weight: .84, depth: -.13 },
  { x: .41, y: .25, dx: -.83, dy: -.56, length: .17, bend: -.055, spread: .022, weight: .55, depth: -.2 },
] as const;

const depthAt = (samples: Uint8Array, record: number, size: number) =>
  (samples[record + 2] / 255 - .5) * size * .5;

const toneAt = (samples: Uint8Array, record: number) => (samples[record + 3] >> 4) / 15;

export function tracePortraitSilhouette(samples: Uint8Array, size: number, count: number) {
  const compact = size < 100;
  const reach = size * (compact ? .19 : .245);
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

  const edge = new Float32Array(count);
  for (let index = 0; index < count; index++) {
    const cell = gridCell(6 + index * 5);
    if (outside[cell - 1] || outside[cell + 1] || outside[cell - width] || outside[cell + width]) {
      edge[index] = 1;
    } else if (outside[cell - 2] || outside[cell + 2] || outside[cell - width * 2] || outside[cell + width * 2]) {
      edge[index] = .4;
    }
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
  const boundary: number[] = [];
  const rimReach = size * (compact ? .091 : .111);
  for (let index = 0; index < tail; index++) {
    const cell = queue[index];
    if (distances[cell] > reach * reach || nearest[cell] < 0 || distances[cell] < 1) continue;
    if (distances[cell] === 1) boundary.push(cell);
    const distance = Math.sqrt(distances[cell]);
    const x = cell % width - padding, y = Math.floor(cell / width) - padding;
    const source = records[nearest[cell]];
    const tone = toneAt(samples, source);
    const outwardX = (x + padding - nearest[cell] % width) / distance;
    const outwardY = (y + padding - Math.floor(nearest[cell] / width)) / distance;
    // The cropped hem should taper faster than the open air near the head and shoulders.
    const hem = y > size * .73 ? Math.max(.43, 1 - outwardY * .58) : 1;
    const grain = .82 + .18 * Math.sin(x * .16 - y * .19);
    const rim = Math.max(0, 1 - distance / (rimReach * hem * grain));
    const outer = Math.max(0, 1 - distance / (reach * hem));
    const rimChance = (compact ? .64 : .73) * rim ** 1.4;
    const dustChance = (compact ? .034 : .052) * outer ** 1.75 * (1 - rim);
    const roll = noise(cell, 1);
    if (roll > rimChance + dustChance) continue;

    const dust = roll > rimChance;
    const fade = dust ? outer : rim;
    const lateral = (noise(cell, 4) - .5) * (dust ? 2.2 : 1.3);
    const depthSpread = distance * (dust ? 1.7 : .78);
    fringe.push({
      x: x + .5 - outwardY * lateral + (noise(cell, 2) - .5) * .85,
      y: y + .5 + outwardX * lateral + (noise(cell, 3) - .5) * .85,
      depth: depthAt(samples, source, size) + depthSpread * (noise(cell, 6) * 1.65 - .92),
      tone,
      opacity: dust ? (.16 + .16 * noise(cell, 7)) * fade : (.24 + tone * .24 + noise(cell, 7) * .13) * fade ** 1.24,
      radius: (.14 + noise(cell, 8) * .16) * (dust ? .68 + .32 * fade : .88 + .19 * fade) * (compact ? 1.1 : 1),
      flowX: outwardX * .6 - outwardY * .5,
      flowY: outwardY * .6 + outwardX * .5,
      mobility: dust ? .91 : .27 + .39 * (1 - fade),
    });
  }

  for (const [streamIndex, stream] of streams.entries()) {
    const goalX = stream.x * size + padding, goalY = stream.y * size + padding;
    let root = -1, best = Infinity;
    for (const cell of boundary) {
      const origin = nearest[cell];
      const ox = origin % width, oy = Math.floor(origin / width);
      const facing = (cell % width - ox) * stream.dx + (Math.floor(cell / width) - oy) * stream.dy;
      if (facing < .23) continue;
      const score = (ox - goalX) ** 2 + (oy - goalY) ** 2 + (1 - facing) * size;
      if (score < best) { root = origin; best = score; }
    }
    if (root < 0) continue;

    const source = records[root];
    const rootX = samples[source] * .5 + .25, rootY = samples[source + 1] * .5 + .25;
    const tone = toneAt(samples, source);
    const rootDepth = depthAt(samples, source, size);
    const streamCount = Math.round((compact ? 62 : 154) * stream.weight);
    for (let index = 0; index < streamCount; index++) {
      const seed = streamIndex * 604 + index;
      const t = ((index + noise(seed, 1)) / streamCount) ** 1.3;
      const drift = stream.length * t * (compact ? .73 : 1);
      const bend = stream.bend * t * (t - .12);
      const across = noise(seed, 2) + noise(seed, 3) - 1;
      const branch = Math.max(0, t - .28) * stream.spread * (seed % 3 === 1 ? 1.55 : -.34);
      const spread = stream.spread * (.48 + .71 * Math.sin(Math.PI * t)) * across + branch;
      const x = rootX + size * (stream.dx * drift - stream.dy * (bend + spread));
      const y = rootY + size * (stream.dy * drift + stream.dx * (bend + spread));
      const cell = (padding + Math.floor(y)) * width + padding + Math.floor(x);
      if (x < -padding || x >= size + padding || !outside[cell]) continue;

      const fade = (1 - t) ** 1.28;
      fringe.push({
        x, y, tone,
        depth: rootDepth + size * (stream.depth * t + (noise(seed, 4) - .5) * (.035 + t * .17)),
        opacity: (.30 + tone * .18 + .24 * noise(seed, 5)) * fade,
        radius: (.17 + .18 * noise(seed, 6)) * (.72 + .28 * fade) * (compact ? 1.16 : 1),
        flowX: stream.dx - stream.dy * t * stream.bend * 6,
        flowY: stream.dy + stream.dx * t * stream.bend * 6,
        mobility: .57 + t * .29,
      });
    }
  }
  return { edge, fringe };
}
