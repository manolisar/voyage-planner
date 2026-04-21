# Voyage Planner — Project Charter

> Single-page speed/power/fuel consumption model for a vessel with **4× Wärtsilä 16V46** diesel generators.
> Companion tool to [Voyage Tracker v7](../Voyage_Tracker_v7/) (which logs actuals); this one models forecasts.

---

## 1. What this app is

A static SPA used by Chief Engineers / voyage planners to model fuel burn **before** a voyage runs:

- Pick how many DGs are available and which fuel each runs (HFO / MGO / LSFO).
- Dial in vessel speed, hotel load, sea margin, SFOC deterioration.
- The engine solves prop-power demand (speed → kW via FAT curve), distributes load across running DGs, interpolates SFOC per engine, and returns **total fuel rate (t/h) split by fuel type**.
- Build a voyage from sea legs + port hours + standby hours; totals roll up in MT.
- Export / import voyages as JSON.

No backend. No auth. State lives in React; voyages are user-downloaded JSON blobs.

---

## 2. Tech stack

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS 4** (CSS-first config in `src/app.css`)
- Deployment: **GitHub Pages** via `.github/workflows/deploy.yml` (builds from source on push to `main`, uploads `dist/`)

---

## 3. Domain model (computation core)

All pure functions under `src/engine/` and `src/data/`:

- `data/trialData.ts` — FAT trial curves (speed → prop kW, load fraction → SFOC).
- `data/engineDefaults.ts` — engine config (4 DGs, DG3 MGO-locked = no HFO bunker connection) + load limits.
- `engine/interpolation.ts` — linear interp on the trial tables.
- `engine/loadSharing.ts` — picks the minimum set of available DGs to cover demand, distributes kW across them.
- `engine/consumption.ts` — orchestrates: speed + engines + settings → `CalculationResult` (per-fuel rates, totals, overload flags).

Types live in `src/types/index.ts`. Key shapes: `EngineState`, `EngineResult`, `CalculationResult`, `SeaLeg`, `PortEntry`, `StandbyEntry`, `Voyage`.

**Rule:** the engine never reaches into React. Components pass state in, get a `CalculationResult` back. No side effects.

---

## 4. Visual design — Signal Flag Bands (v7-inspired)

The visual language is carried from **Voyage Tracker v7**'s *Signal Flag Bands* theme. See `/Users/Manos/Projects/Voyage_Tracker_v7/CLAUDE.md` §7 for the full spec; the parts that apply here:

### Stratified card motif (`.cat-card`)

Every main section renders as a three-stratum card, top-down:

1. **8px colored top bar** (`::after`) — the pennant. Variant determines color (see below).
2. **Title strip** (`.cat-label`) — opaque `--color-surface-2` rail with a mono-font tag pill (`.cat-tag`) and the section title.
3. **Faintly tinted body** (`.cat-body` / direct children) — 3–4% tint of the variant color, card-level (not body-level) so uneven-height siblings in a grid row share the tint.

**Variants** (value of the `tagStyle` prop on `<Panel>`):

| Variant  | Top-bar color                 | Used for           |
|----------|-------------------------------|--------------------|
| `engine` | navy `#0F172A`                | Diesel Generators  |
| `param`  | ocean-cyan `#06B6D4`          | Parameters         |
| `result` | mgo-green `#10B981`           | (reserved)         |
| `legs`   | lsfo-indigo `#818CF8`         | Cruise Leg Planner |
| `voyage` | water-blue `#38BDF8`          | Voyage Builder     |

> Naming note: the `tagStyle` prop uses `engine` (singular), but the internal CSS class is `.cat-card.engines` (plural). Panel.tsx maps between them. Other variants share the same name on both sides.

### Engine cards (special-cased)

Engine cards are *also* stratified (6px fuel-colored top band) but **do not use a full-card wash** — the body is near-white (`--color-surface`) with a 3.5% fuel tint only. The fuel identity lives in:

1. The 6px top band (HFO orange / MGO green / LSFO indigo).
2. The `.fuel-badge` pill next to the DG label.

**Rule — "the band carries identity, not a full-card wash":** do not apply `bg-hfo-light` / `bg-mgo-light` / `bg-lsfo-light` to an engine card body. The pale cream of HFO-light reads as beige/sand at card scale. Use 3.5% tint + band + badge instead.

### Palette (v7-aligned)

- **Primary accent:** ocean-cyan (`--color-ocean-500: #06b6d4`). Buttons, logo gradient, Total pill, focus rings, link color. Replaces the old indigo-blue `#2563eb` accent.
- **Fuel bands:** HFO `#D97706`/`#F59E0B`, MGO `#059669`/`#10B981`, LSFO `#6366F1`/`#818CF8`. These are *stable* across the app — never reassign them.
- **Surfaces:** `--color-bg` `#FAFBFD`, `--color-surface` `#FFFFFF`, `--color-surface-2` `#F3F5F9`, `--color-bdr` `#E5E9F0`.

### Typography

- **UI:** Manrope (400–800).
- **Numerics:** IBM Plex Mono (400–700) with `tabular-nums` for aligned decimal columns.
- Use `.form-label` for tiny-caps form labels, `.form-input` for mono inputs.

### Motion

- `.cat-card` hover: `translateY(-2px)` + soft shadow.
- Mount animation: `@keyframes slideUp`, 80ms staggered per `.grid > .cat-card:nth-child(N)`.
- All motion auto-disabled under `prefers-reduced-motion: reduce`.

---

## 5. Component layout

```
src/components/
├── layout/
│   ├── Header.tsx          # ocean-cyan anchor logo + tagline + settings button
│   ├── Footer.tsx
│   └── Panel.tsx           # <Panel tag tagStyle title/> → .cat-card with top-bar + title strip
├── engines/
│   ├── EnginePanel.tsx     # wraps <Panel tagStyle="engine">, grid of 4 EngineCards
│   └── EngineCard.tsx      # 6px top band + fuel badge + toggle + fuel select + load bar
├── parameters/
│   └── ParametersPanel.tsx # speed, hotel load, sea margin, SFOC deterioration
├── results/
│   └── ResultsPanel.tsx    # sticky strip at top: power, engines, HFO/MGO/LSFO rates, Total pill
├── planner/
│   ├── SeaLegPlanner.tsx
│   ├── PortHoursEntry.tsx
│   └── StandbyHoursEntry.tsx
├── voyage/
│   ├── VoyageExport.tsx    # from/to/date + Save/Load JSON
│   └── VoyageSummary.tsx
└── settings/
    └── SettingsModal.tsx
```

`App.tsx` is the single state owner — all DG / settings / legs / port / standby state lives there; children are controlled.

---

## 6. Development

```bash
npm run dev      # Vite dev server (HMR)
npm run build    # tsc -b && vite build → dist/
npm run lint
npm run preview  # serve dist/
```

Preview server name in `.claude/launch.json`: **`voyage-planner`** (port 8091).

---

## 7. Operating principles

- **The engine is the source of truth.** If the UI disagrees with `computeConsumption()`, fix the UI.
- **Fuel colors are stable.** HFO = orange, MGO = green, LSFO = indigo. Everywhere. Always.
- **Band carries identity, not full-card wash.** (See §4.)
- **Sibling project:** Voyage Tracker v7 (`~/Projects/Voyage_Tracker_v7/`) logs *actuals* against per-ship network folders; this app models *forecasts*. The two share the Signal Flag Bands design language but no code.

---

*Last updated: 2026-04-21.*
