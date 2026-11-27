# Research Studio prototype

The prototype lives at `/preview/research-studio` in local development. A deployed preview requires `RESEARCH_STUDIO_PREVIEW=1` at build time. The home route continues to render Interwoven Intelligence.

## Editing the model

- `studio-plan.ts` defines the four bay coordinates and the forecasting phases.
- `studio-architecture.ts` models the foundation, service routes, reserved bays, and glazing. The preview query `shell=A` shows the open shell and `shell=B` adds the deeper smoked-glass enclosure. The default is the hybrid shell.
- `studio-model.ts` derives materials from portfolio tokens, rounds and batches opaque geometry, and creates the local contact shading and nameplates. Transparent panes stay separate for depth sorting.
- `studio-light.ts` creates a small prefiltered environment map once, with a warm key light and restrained fill. The preview queries `light=soft` and `light=rim` show the alternative light rigs.
- `station-learning.ts` contains the sensor manifold, transparent chamber, encoder rotor, compute modules, forecast panes and conduit paths. Its data particles are instanced. The visible forecast shapes are illustrative and carry no measured values.
- `studio-runtime.ts` handles camera framing, rendering and resource disposal. `ResearchStudio.tsx` owns inspection, input, focus and project links. The three reserved bays are available for future models.

The model is generated from editable Three.js geometry. The two small WebP files are transparent renders of the same scene, used when WebGL is unavailable. The preview query `still=1` freezes the process for captures.
