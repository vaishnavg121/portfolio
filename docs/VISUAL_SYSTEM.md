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

## Future Integrations
- **Rive Integration**: The `CompanionPlaceholder` implements `CompanionRendererProps`. In the future, a `.riv` component will simply replace the SVG output while utilizing the exact same state machine.
- **Sound Architecture**: The foundation prepares for a non-intrusive sound system (`soundEnabled = false`).
