# Algorithm Visualizer

Animated sorting and pathfinding in plain HTML, CSS and JavaScript. Watch bubble, merge and quick sort race on the same array, or Dijkstra and A* race across a grid you draw walls on. Live counters show comparisons, writes and nodes expanded, and a built-in benchmark measures real running times to compare with the theory.

## Run it

Open `index.html` in a browser. No build step, no dependencies.

## Features

**Sorting tab**
- Bubble, merge and quick sort run side by side on identical input
- Live comparison and write counts, next to the theoretical figure (n(n-1)/2 or n·log₂n)
- Array size and speed sliders
- Timing benchmark that outputs a Markdown table

**Pathfinding tab**
- Dijkstra vs A* (Manhattan heuristic) on a 36 × 22 grid, 4-directional movement
- Draw and erase walls by dragging, move start and goal, or generate random walls
- Live count of nodes expanded and path length

## How the algorithms are instrumented

Each algorithm is a JavaScript generator that `yield`s after every comparison or write. The render loop advances the generators a few steps per frame, which makes animation and counting the same code path. The benchmark uses separate plain functions with the same logic but no `yield`, so generator overhead doesn't distort timings.

## Sorting: theory

| Algorithm | Best | Average | Worst | Extra space |
|---|---|---|---|---|
| Bubble (with early exit) | O(n) | O(n²) | O(n²) | O(1) |
| Merge | O(n log n) | O(n log n) | O(n log n) | O(n) |
| Quick (last-element pivot) | O(n log n) | O(n log n) | O(n²) | O(log n) stack |

## Sorting: measured timings

Click **Run timing benchmark** and paste the table it produces below, replacing the placeholder. Each figure is the median of 5 runs on random input.

<!-- Paste your results here -->
| n | Bubble (ms) | Merge (ms) | Quick (ms) | Bubble comps | Merge comps | Quick comps |
|---|---|---|---|---|---|---|
| 500 | | | | | | |
| 1000 | | | | | | |
| 2000 | | | | | | |
| 4000 | | | | | | |
| 8000 | | | | | | |

Machine, browser and date: _fill in_

### How to read it

Use the **doubling test**: each row doubles n, so compare each row with the one above.
- O(n²) predicts the time roughly **quadruples** per row. Bubble sort should show about ×4.
- O(n log n) predicts a little **more than doubles** per row (about ×2.1 to ×2.2 at these sizes). Merge and quick sort should show this.
- Comparison counts are machine-independent. Bubble sort should land near n(n-1)/2 (n = 8000 gives about 32 million) and merge and quick sort near n·log₂n (about 104,000 for n = 8000).

Wall-clock times are noisy (JIT warm-up, background tasks, timer resolution), so treat small differences with caution and lean on the comparison counts for the clean story. Add a short paragraph here on how your numbers compare with the predictions.

## Pathfinding: Dijkstra vs A*

- Every step costs 1, so Dijkstra expands cells in widening rings around the start (equivalent to breadth-first search) until it reaches the goal.
- A* orders its queue by `g + h`, where `h` is the Manhattan distance to the goal. That heuristic never overestimates on a 4-directional grid, so A* still finds a shortest path while expanding far fewer nodes when there is a clear direction to the goal.
- Both use a binary-heap priority queue, giving O((V + E) log V). Ties in A* prefer cells closer to the goal.
- With a big wall between start and goal, or no route at all, the gap narrows and both explore most of the grid.

## Experiments

1. Compare A* vs Dijkstra on an empty grid, then with random walls, then with a wall that forces a long detour. Record nodes expanded in each case.
2. Run sorting at n = 150, then n = 15, and watch how the comparison counts diverge.
3. Draw a closed box around the goal and confirm both report "no path".

## Files

- `index.html`: layout and controls
- `style.css`: styling
- `script.js`: sorting generators, benchmark, grid search, rendering

## Ideas to extend

- Add insertion, heap and selection sort
- Add a diagonal-movement mode with an octile heuristic
- Add weighted cells ("mud") so Dijkstra and A* differ in more than node count
- Add a pre-sorted and reverse-sorted input option to show quick sort's O(n²) worst case
