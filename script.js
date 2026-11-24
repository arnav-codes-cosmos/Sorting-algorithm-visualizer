const $ = id => document.getElementById(id);
let tab = 'sort';
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => {
  tab = b.dataset.tab;
  document.querySelectorAll('[data-tab]').forEach(x => x.classList.toggle('on', x === b));
  $('sort').hidden = tab !== 'sort'; $('path').hidden = tab !== 'path';
});

/* ---------- Sorting (generators yield after every comparison/write so they can be animated) ---------- */
function* bubble(s) {
  const a = s.a, n = a.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      s.c++; s.hi = [j, j + 1];
      if (a[j] > a[j + 1]) { [a[j], a[j + 1]] = [a[j + 1], a[j]]; s.w += 2; swapped = true; }
      yield;
    }
    if (!swapped) break;
  }
}
function* merge(s) {
  const a = s.a, aux = a.slice();
  function* sort(lo, hi) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1;
    yield* sort(lo, mid); yield* sort(mid + 1, hi);
    for (let t = lo; t <= hi; t++) aux[t] = a[t];
    let i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) {
      s.c++; s.hi = [i, j];
      a[k++] = aux[i] <= aux[j] ? aux[i++] : aux[j++]; s.w++; yield;
    }
    while (i <= mid) { a[k++] = aux[i++]; s.w++; s.hi = [k - 1]; yield; }
    while (j <= hi) { a[k++] = aux[j++]; s.w++; s.hi = [k - 1]; yield; }
  }
  yield* sort(0, a.length - 1);
}
function* quick(s) {
  const a = s.a;
  function* sort(lo, hi) {
    if (lo >= hi) return;
    const p = a[hi]; let i = lo;
    for (let j = lo; j < hi; j++) {
      s.c++; s.hi = [j, hi];
      if (a[j] < p) { [a[i], a[j]] = [a[j], a[i]]; s.w += 2; i++; }
      yield;
    }
    [a[i], a[hi]] = [a[hi], a[i]]; s.w += 2; yield;
    yield* sort(lo, i - 1); yield* sort(i + 1, hi);
  }
  yield* sort(0, a.length - 1);
}
const ALGOS = [['bubble', bubble], ['merge', merge], ['quick', quick]];
let base, S = [], running = false;

function shuffled(n) {
  const a = Array.from({length: n}, (_, i) => i + 1);
  for (let i = n - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function resetSort() {
  S = ALGOS.map(([id, fn]) => { const s = {id, a: base.slice(), c: 0, w: 0, hi: [], done: false}; s.g = fn(s); return s; });
  running = false; $('sgo').textContent = 'Start';
}
function newArray() { base = shuffled(+$('sn').value); resetSort(); }
$('sn').oninput = () => { $('osn').textContent = $('sn').value; newArray(); };
$('snew').onclick = newArray;
$('sgo').onclick = () => {
  if (S.every(s => s.done)) resetSort();
  running = !running; $('sgo').textContent = running ? 'Pause' : 'Start';
};

function drawSort() {
  const n = base.length;
  for (const s of S) {
    const cv = $('cv-' + s.id), ctx = cv.getContext('2d'), w = cv.width, h = cv.height, bw = w / n;
    ctx.clearRect(0, 0, w, h);
    s.a.forEach((v, i) => {
      ctx.fillStyle = s.done ? '#5fc48a' : s.hi.includes(i) ? '#ef5b4c' : '#4c9be8';
      const bh = v / n * (h - 4); ctx.fillRect(i * bw, h - bh, Math.max(1, bw - 1), bh);
    });
    $('st-' + s.id).textContent = `${s.c.toLocaleString()} comparisons · ${s.w.toLocaleString()} writes`
      + (s.id === 'bubble' ? ` · n(n-1)/2 = ${(n * (n - 1) / 2).toLocaleString()}` : ` · n·log₂n ≈ ${Math.round(n * Math.log2(n)).toLocaleString()}`);
  }
}

/* ---------- Timing benchmark (plain functions, no yields) ---------- */
let C = 0;
function bubbleP(a) {
  for (let i = 0, n = a.length; i < n - 1; i++) {
    let sw = false;
    for (let j = 0; j < n - 1 - i; j++) { C++; if (a[j] > a[j + 1]) { const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; sw = true; } }
    if (!sw) break;
  }
}
function mergeP(a) {
  const aux = a.slice();
  (function sort(lo, hi) {
    if (lo >= hi) return;
    const mid = (lo + hi) >> 1; sort(lo, mid); sort(mid + 1, hi);
    for (let t = lo; t <= hi; t++) aux[t] = a[t];
    let i = lo, j = mid + 1, k = lo;
    while (i <= mid && j <= hi) { C++; a[k++] = aux[i] <= aux[j] ? aux[i++] : aux[j++]; }
    while (i <= mid) a[k++] = aux[i++];
    while (j <= hi) a[k++] = aux[j++];
  })(0, a.length - 1);
}
function quickP(a) {
  (function sort(lo, hi) {
    if (lo >= hi) return;
    const p = a[hi]; let i = lo;
    for (let j = lo; j < hi; j++) { C++; if (a[j] < p) { const t = a[i]; a[i] = a[j]; a[j] = t; i++; } }
    const t = a[i]; a[i] = a[hi]; a[hi] = t;
    sort(lo, i - 1); sort(i + 1, hi);
  })(0, a.length - 1);
}
function measure(fn, arr) {
  const times = [];
  for (let r = 0; r < 5; r++) { const a = arr.slice(); C = 0; const t = performance.now(); fn(a); times.push(performance.now() - t); }
  times.sort((x, y) => x - y);
  return [times[2], C];   // median of 5 runs
}
$('bench').onclick = () => {
  $('bstat').textContent = 'Running…'; $('bench').disabled = true;
  setTimeout(() => {
    const rows = ['| n | Bubble (ms) | Merge (ms) | Quick (ms) | Bubble comps | Merge comps | Quick comps |', '|---|---|---|---|---|---|---|'];
    for (const n of [500, 1000, 2000, 4000, 8000]) {
      const arr = shuffled(n), r = [bubbleP, mergeP, quickP].map(f => measure(f, arr));
      rows.push(`| ${n} | ${r.map(x => x[0].toFixed(2)).join(' | ')} | ${r.map(x => x[1]).join(' | ')} |`);
    }
    $('bout').textContent = rows.join('\n'); $('bout').hidden = false;
    $('bstat').textContent = 'Median of 5 runs. Click the table to select it, then paste it into the README.';
    $('bench').disabled = false;
  }, 30);
};

/* ---------- Pathfinding ---------- */
const COLS = 36, ROWS = 22, CS = 18, N = COLS * ROWS, D = [[1, 0], [-1, 0], [0, 1], [0, -1]];
let walls = new Uint8Array(N), start = 11 * COLS + 4, goal = 11 * COLS + COLS - 5, P = [], runP = false;

function push(h, x) { let i = h.push(x) - 1; while (i) { const p = (i - 1) >> 1; if (h[p][0] <= x[0]) break; h[i] = h[p]; i = p; } h[i] = x; }
function pop(h) {
  const top = h[0], x = h.pop();
  if (h.length) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= h.length) break; if (c + 1 < h.length && h[c + 1][0] < h[c][0]) c++; if (h[c][0] >= x[0]) break; h[i] = h[c]; i = c; } h[i] = x; }
  return top;
}
function* search(s) {
  const dist = new Float64Array(N).fill(Infinity), prev = new Int32Array(N).fill(-1), heap = [];
  const H = i => Math.abs(i % COLS - goal % COLS) + Math.abs((i / COLS | 0) - (goal / COLS | 0));
  dist[start] = 0; push(heap, [0, start]);
  while (heap.length) {
    const u = pop(heap)[1];
    if (s.closed[u]) continue;
    s.closed[u] = 1; s.exp++;
    if (u === goal) { for (let v = u; v !== -1; v = prev[v]) s.path.push(v); s.state = 'path found'; return; }
    const x = u % COLS, y = u / COLS | 0;
    for (const [dx, dy] of D) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS) continue;
      const v = ny * COLS + nx;
      if (walls[v] || s.closed[v]) continue;
      const nd = dist[u] + 1;
      if (nd < dist[v]) { dist[v] = nd; prev[v] = u; s.open[v] = 1; push(heap, [nd + (s.useH ? H(v) * 1.000001 : 0), v]); }
    }
    yield;
  }
  s.state = 'no path';
}
function resetPath() {
  P = [false, true].map(useH => { const s = {id: useH ? 'astar' : 'dij', useH, closed: new Uint8Array(N), open: new Uint8Array(N), path: [], exp: 0, state: 'ready'}; s.g = search(s); return s; });
  runP = false; $('pgo').textContent = 'Run';
}
$('pgo').onclick = () => { if (P.every(s => s.state !== 'ready')) resetPath(); runP = !runP; $('pgo').textContent = runP ? 'Pause' : 'Run'; };
$('preset').onclick = resetPath;
$('pclear').onclick = () => { walls.fill(0); resetPath(); };
$('prand').onclick = () => { for (let i = 0; i < N; i++) walls[i] = i !== start && i !== goal && Math.random() < 0.28 ? 1 : 0; resetPath(); };

let drag = null, paint = 1;
function cellAt(e, cv) {
  const r = cv.getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * COLS), y = Math.floor((e.clientY - r.top) / r.height * ROWS);
  return x < 0 || y < 0 || x >= COLS || y >= ROWS ? -1 : y * COLS + x;
}
['dij', 'astar'].forEach(id => {
  const cv = $('cv-' + id);
  cv.onpointerdown = e => {
    cv.setPointerCapture(e.pointerId);
    const c = cellAt(e, cv); if (c < 0) return;
    if (c === start || c === goal) drag = c === start ? 's' : 'g';
    else { drag = 'w'; paint = walls[c] ? 0 : 1; walls[c] = paint; resetPath(); }
  };
  cv.onpointermove = e => {
    if (!drag) return;
    const c = cellAt(e, cv); if (c < 0 || c === start || c === goal) return;
    if (drag === 'w') { if (walls[c] !== paint) { walls[c] = paint; resetPath(); } }
    else if (!walls[c]) { if (drag === 's') start = c; else goal = c; resetPath(); }
  };
  cv.onpointerup = () => drag = null;
});

function drawPath() {
  for (const s of P) {
    const cv = $('cv-' + s.id), ctx = cv.getContext('2d'), onPath = new Set(s.path);
    ctx.fillStyle = '#18202b'; ctx.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < N; i++) {
      ctx.fillStyle = i === start ? '#5fc48a' : i === goal ? '#ef5b4c' : walls[i] ? '#566274' : onPath.has(i) ? '#f2c94c'
        : s.closed[i] ? '#2f5f94' : s.open[i] ? '#1f3550' : '#202a37';
      ctx.fillRect((i % COLS) * CS + 1, (i / COLS | 0) * CS + 1, CS - 2, CS - 2);
    }
    $('ps-' + s.id).textContent = `${s.exp} nodes expanded` + (s.path.length ? ` · path length ${s.path.length - 1}` : '') + ` · ${s.state}`;
  }
}

/* ---------- Main loop ---------- */
function loop() {
  const ops = Math.max(1, $('speed').value ** 2 / 60 | 0);
  if (tab === 'sort') {
    if (running) {
      for (const s of S) if (!s.done) for (let k = 0; k < ops; k++) if (s.g.next().done) { s.done = true; s.hi = []; break; }
      if (S.every(s => s.done)) { running = false; $('sgo').textContent = 'Start'; }
    }
    drawSort();
  } else {
    if (runP) for (const s of P) if (s.state === 'ready') for (let k = 0; k < ops; k++) if (s.g.next().done) break;
    if (runP && P.every(s => s.state !== 'ready')) { runP = false; $('pgo').textContent = 'Run'; }
    drawPath();
  }
  requestAnimationFrame(loop);
}
newArray(); resetPath(); loop();
