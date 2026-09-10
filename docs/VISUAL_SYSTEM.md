# Visual System Documentation (Phase 2A)

## Design Philosophy
The core identity of this portfolio is "INTELLIGENCE × MARKETS × MACHINES". The tone is professional, cinematic, and technically sophisticated, inspired heavily by editorial layouts and functional user interfaces. The design explicitly avoids generic portfolio templates in favor of a "system pipeline" aesthetic.

## Anime Influence Boundaries
The visual language incorporates subtle structural nods to specific anime aesthetics without ever copying characters or copyrighted assets:
- **Death Note**: Psychological, editorial atmosphere created through strict grids, ink reveals, rule/numbering systems (e.g., in Engineering Notes), and handwritten cursive annotations (`Caveat` font).
- **Demon Slayer**: Rhythmic, elemental motion. Interpreted abstractly through flow lines (Windy project), ember fields (AlphaCouncil project), and slash reveals (transitions).

## Effect Primitives
We use a modular set of motion primitives located in `src/components/effects`:
- `InkReveal`: A procedural clip-path reveal using radial gradients to simulate ink spreading across paper. Used for Swa.Neeti and Engineering Notes.
- `SlashTransition`: A fast, diagonal line transition for sharp segment reveals.
- `FlowLines`: Abstract SVG curves with subtle path offsets to simulate wind/data streams. Used for Windy.
- `EmberField`: A restrained particle system using Framer Motion to simulate glowing embers or market pulses. Used for AlphaCouncil.
- `PaperNoise`: An SVG fractal noise filter used to add subtle fiber texture to dark backgrounds. Used for Engineering Notes.

## Companion States and Architecture
The Companion system (`src/components/companion/`) is architected to separate state logic from the renderer.
Current states: `IDLE`, `WALK`, `RUN`, `READ`, `SLEEP`, `SURPRISED`, `WIND_BLOWN`, `INSPECT`, `WAVE`.

### Section Behaviors
The companion responds contextually to sections (via IntersectionObserver):
- `hero`: SLEEP -> IDLE
- `work`: WALK
- `alphacouncil`: INSPECT
- `swaneeti`: READ
- `windy`: WIND_BLOWN
- `github`: INSPECT
- `notes`: READ
- `contact`: WAVE

## Project Visual Identities
Each project in `SelectedWork` dynamically mounts an `EffectComponent` based on its thematic identity:
- AlphaCouncil: `EmberField`
- Swa.Neeti: `InkReveal`
- Windy: `FlowLines`
- Spenza: `GridEffect`
- ThriveForce: `BlueprintEffect`

## Reduced Motion Behavior
All custom effects (particles, flow lines, companion travel) respect `prefers-reduced-motion`. They read the media query and either gracefully degrade or skip rendering to ensure the site remains accessible.

## Mobile Optimization
To preserve performance on mobile devices:
- Ember particle counts are restricted or disabled.
- Flow lines use fewer paths.
- Companion movement is simplified.

## Asset Pipeline
The asset architecture separates external media (textures, mascots, project imagery) from component logic via the `src/lib/assets.ts` manifest.
This ensures fallbacks render cleanly until final assets are available.

### Directory Structure
```
public/
  assets/
    mascot/
      vaishnav-companion.riv (future)
    textures/
      paper-noise.webp
    projects/
      [slug]/
        hero.webp
        diagram.svg
        gallery-1.webp
```

### Media Integration
- **Hero & Projects**: WebP or AVIF are recommended for raster assets to maintain sharp scaling and small sizes.
- **Visual Effect Overlays**: SVG masks (e.g. for `InkReveal` or `SlashTransition`) should be minimal `<path>` outputs without embedded `<style>` blocks.
- **Rive Mascot**: `CompanionRenderer` serves as the abstraction point. The state machine provides `state`, `direction`, and `intensity`. Once `.riv` is provided, replace `CompanionPlaceholder` with `@rive-app/react-canvas` in `CompanionRenderer.tsx`.

## REAL ASSET CONTRACT

This site is prepared for external asset integration. The following specifies the expected file drops.

### Mascot Rive File
**Path**: `public/assets/mascot/vaishnav-companion.riv`

**Expected State Machine Inputs**:
- `direction` (Number: -1 for left, 1 for right)
- `intensity` (Number: 0.0 to 1.0)
- `state` (String or Enum):
  - `idle`, `walk`, `run`, `sleep`, `read`, `surprised`, `wind_blown`, `inspect`, `wave`

### Expected Visual Assets & Aspect Ratios
Global Textures:
- `public/assets/textures/paper-noise.webp` (Seamless repeating, 512x512)
- `public/assets/effects/slash-brush.svg` (Diagonal slash mask path)
- `public/assets/effects/ink-mask.svg` (Radial ink spread mask path)

Project Assets (`/assets/projects/[slug]/`):
- `hero.webp`: `16:9` ratio, cinematic overlay. Must support `mix-blend-luminosity` (i.e., high contrast or greyscale optimized).
- `diagram.svg`: Transparent background architecture visual. `1:1` square aspect ratio preferred.
- `gallery-X.webp`: `16:9` screenshots or CAD renders.

### GitHub Integration
Real GitHub data is integrated via server actions (`src/lib/actions/github.ts`) using the GraphQL API.
- Require environment variable: `GITHUB_TOKEN` in `.env.local`
- Must be a Classic Personal Access Token or Fine-Grained Token with `public_data` read access.
- Caches for 1 hour (`revalidate: 3600`).
- If token is missing, the site gracefully falls back to empty states.

### Fallback Strategy
If an external asset is not yet available, the site falls back automatically:
- Missing `diagram.svg` -> renders interactive procedural DOM node chart.
- Missing `hero.webp` -> procedural motion backgrounds (`EmberField`, `FlowLines`, etc.) run as primary visuals.
- Missing `.riv` -> `CompanionPlaceholder` SVG renders in place.

## Future Integrations
- **Rive Integration**: The `CompanionPlaceholder` implements `CompanionRendererProps`. In the future, a `.riv` component will simply replace the SVG output while utilizing the exact same state machine.
- **Sound Architecture**: The foundation prepares for a non-intrusive sound system (`soundEnabled = false`).
