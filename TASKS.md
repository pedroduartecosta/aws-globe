# Globe Feature Tasks

## Features to implement (from backlog items 1, 2, 3, 5, 9, + latency)

| # | Feature | Status | Notes |
|---|---------|--------|-------|
| 1 | **Click-to-inspect regions** — clicking a dot opens a panel with region name, type, status, coordinates, and a provider docs link | ✅ DONE | `onLabelClick` in globe.ts; info panel in index.html; wired in ui.ts |
| 2 | **Multi-provider overlay** — "All Providers" option shows AWS (orange), GCP (blue), Azure (teal) simultaneously; labels hidden to reduce clutter | ✅ DONE | `showAllProviders` state flag; `regionColorForProvider`; all three globes added to scene |
| 3 | **Search / jump-to-region** — text input in header filters regions; clicking a result flies the camera to it | ✅ DONE | `flyToRegion` + `getAllRegions` in globe.ts; search input + dropdown in index.html |
| 5 | **Region count stats** — overlay in header showing per-provider region counts, updates with filter | ✅ DONE | `getRegionCounts` in globe.ts; `#regionStats` div in header |
| 9 | **Legend for color coding** — color swatches with labels for all dot colors; switches to provider-color legend in All Providers mode | ✅ DONE | `.legend-dot` swatches; `#allProviderLegend` / `#singleProviderLegend` toggled in ui.ts |
| L | **Latency overlay** — show estimated inter-region latency as arcs when a region is selected (Cloudping-style) | ⬜ TODO | Need latency data source; draw arcs via ThreeGlobe `.arcsData()`; trigger on region click |

## Latency overlay plan
1. Embed static latency data (JSON keyed by `"region-a → region-b"`) — source from public Cloudping snapshots or hardcode a representative set
2. On region click, filter latency table for rows matching the selected region
3. Draw arcs via `globe.arcsData(arcs).arcColor().arcAltitude().arcLabel()` 
4. Clear arcs when panel is closed or a new region is selected
5. Show latency value in ms on hover (arcLabel) or in the info panel table

## Files touched
- `src/globe.ts` — click handlers, multi-provider colors, flyToRegion, region counts, (TODO: arcs)
- `src/ui.ts` — info panel, search, stats overlay
- `src/state.ts` — showAllProviders flag
- `dist/index.html` — all new HTML/CSS elements
- `src/data/latency.ts` — (TODO: static latency dataset)
