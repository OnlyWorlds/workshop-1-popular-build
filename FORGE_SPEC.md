# Workshop Base — Forge Specification

**Foundation**: WORKSHOP template (6 blocks)
**Assembled**: 2026-02-12
**Purpose**: Universal base for any OnlyWorlds tool — workshop builds, Element Viewer trial, anything.

---

## What's Here

A clean, building, framework-agnostic foundation with:
- Auth flow (login → auto-reconnect → logout)
- Full SDK access (all 22 element types, CRUD)
- OnlyWorlds visual identity (dark theme, CSS variables, design system)
- Toast notifications (success/error/info)
- Modal base class (extend for detail views, confirmations, overlays)
- localStorage wrapper (type-safe get/set)
- Vite + TypeScript configured and building

**`src/app.ts`** is the blank canvas. Everything is wired. Start building.

---

## Available Add-On Blocks (Not Included)

These blocks are in Assembly's library. If your build needs any of them, copy the source files from Assembly and add the npm dependencies.

**Assembly location**: `C:\Users\Titus\Carrier\Assembly\blocks\`

---

### Visualization

#### Three.js 3D Graphics
**Block**: `onlyworlds-three-graphics` v1.0.0
**Location**: `blocks/visualization/onlyworlds-three-graphics/`
**npm**: `three@^0.160.0`
**What it does**: Three.js scene management — billboard sprites, camera controls, raycasting, 3D drag-drop. Complete scene lifecycle with cleanup.
**Use when**: Building 3D world explorers, spatial visualizations, pin boards with depth, interactive 3D scenes.
**Files**: `src/three-manager.ts`, `src/camera-manager.ts`, `src/sprite-manager.ts`
**Note**: Conflicts with Leaflet 2D — choose one rendering approach. 95% test coverage (highest quality block).

#### Pin System
**Block**: `onlyworlds-pin-system` v1.0.0
**Location**: `blocks/visualization/onlyworlds-pin-system/`
**npm**: `three@^0.170.0`
**Requires**: `onlyworlds-three-graphics`
**What it does**: Pin management with OW element type colors, glow effects, selection states, locking. Pins represent elements on a spatial canvas.
**Use when**: Building pin boards, spatial layouts, element placement tools.

#### Connection Lines
**Block**: `onlyworlds-connection-lines` v1.0.1
**Location**: `blocks/visualization/onlyworlds-connection-lines/`
**npm**: `three@^0.170.0`
**Requires**: `onlyworlds-pin-system`
**What it does**: 3D Line2 + 2D canvas curved paths between pins. Visualizes relationships between elements.
**Use when**: Building relationship graphs, connection visualizers, network diagrams.

#### Leaflet 2D Maps
**Block**: `onlyworlds-leaflet-2d` v1.0.0
**Location**: `blocks/visualization/onlyworlds-leaflet-2d/`
**npm**: `leaflet@^1.9.0`
**What it does**: 2D canvas with Leaflet CRS.Simple — pan/zoom, icon pins, label pins, visibility controls, connection lines. Layer groups for z-index management.
**Use when**: Building 2D map viewers, spatial browsers, territory visualizers. Works well on mobile (touch gestures, pinch zoom).
**Note**: Conflicts with Three.js — choose one rendering approach.

---

### Integration

#### AI Integration
**Block**: `onlyworlds-ai-integration` v1.0.0
**Location**: `blocks/integration/onlyworlds-ai-integration/`
**npm**: `openai@^4.0.0`
**Requires**: `onlyworlds-auth-basic`, `onlyworlds-token-rating` (peer)
**What it does**: Dual-mode AI — user-provided API keys or token-based access. LLM prompt templates and context builders for OnlyWorlds data. Provider pattern for swappable backends.
**Use when**: Building AI-powered tools — lore generators, character analyzers, world critics, chat-based worldbuilding.
**Note**: Requires user to have an OpenAI API key. Adds complexity — only include if the spec calls for AI.

#### Token Rating
**Block**: `onlyworlds-token-rating` v1.0.0
**Location**: `blocks/integration/onlyworlds-token-rating/`
**npm**: `@onlyworlds/sdk@^2.1.0`
**What it does**: Token economy — 5K daily allocation, spending mechanics, growth calculations. localStorage + API hybrid for balance tracking.
**Use when**: Building tools with usage limits, voting systems, resource-gated features.

---

### Organization

#### Map System
**Block**: `onlyworlds-map-system` v2.0.0
**Location**: `blocks/organization/onlyworlds-map-system/`
**npm**: `@onlyworlds/sdk@^2.1.0`
**What it does**: Hierarchical map navigation with unlimited depth — breadcrumb trails, cycle detection, two-tier caching, event-driven updates. Manages parent→child map relationships.
**Use when**: Building map browsers, hierarchical navigation, territory exploration tools.

---

### UI & Utility (Already Partially Included)

#### Visual Persistence
**Block**: `onlyworlds-visual-persistence` v1.0.0
**Location**: `blocks/utility/onlyworlds-visual-persistence/`
**What it does**: Debounced auto-saves for visual state (positions, layouts), backup/restore, JSON import/export. Event-driven architecture.
**Use when**: Building tools where users arrange things spatially and expect their layout to persist (pin boards, custom dashboards, drag-and-drop editors).

#### Theme System
**Block**: `theme-system` v1.0.0
**Location**: `blocks/utility/theme-system/`
**What it does**: Dark/light mode toggle with system preference detection. Auto-creates UI toggle button.
**Use when**: Building tools that need a light mode option. (The visual identity block defaults to dark — this adds the toggle.)

#### Sprite Library
**Block**: `onlyworlds-sprite-library` v1.0.0
**Location**: `blocks/media/onlyworlds-sprite-library/`
**What it does**: Manifest-based sprite loading from URLs, LRU cache with concurrent load limiting, search by name/category/tags.
**Use when**: Building tools that display element icons, type sprites, or custom imagery from a manifest.

---

## How to Add a Block

1. Copy the block's `src/` files into your project
2. Fix import paths (block files reference sibling blocks via `../../` — adjust to `../`)
3. Add npm dependencies from the block's `block.json`
4. Import and use

Example — adding Leaflet 2D:
```bash
npm install leaflet@^1.9.0 @types/leaflet
```
Then copy `blocks/visualization/onlyworlds-leaflet-2d/src/` into `src/visualization/` and import.

---

## OnlyWorlds SDK Quick Reference

```typescript
const sdk = getSDKManager();

// All 22 element types available as properties:
sdk.characters    sdk.creatures     sdk.species       sdk.families
sdk.collectives   sdk.institutions  sdk.locations     sdk.objects
sdk.constructs    sdk.abilities     sdk.traits        sdk.titles
sdk.languages     sdk.laws          sdk.events        sdk.narratives
sdk.phenomena     sdk.relations     sdk.maps          sdk.pins
sdk.markers       sdk.zones         sdk.worlds

// Each supports: .list(filters?), .get(id), .create(data), .update(id, data), .delete(id)

// Relationships are bidirectional:
// character.location → { id, name, element_type: 'location', ... }
// character.species  → [{ id, name, element_type: 'species', ... }]
```

---

**Assembled by**: Kael (Assembly)
**For**: Temper (Forge) — workshop builds, Element Viewer trial, any OnlyWorlds tool
