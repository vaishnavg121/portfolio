# Research Studio prototype

The prototype lives at `/preview/research-studio` in local development. A deployed preview requires `RESEARCH_STUDIO_PREVIEW=1` at build time. The home route continues to render Interwoven Intelligence.

## Editing the model

- `studio-plan.ts` defines the four bay coordinates, phase labels, and project links for the two completed stations.
- `studio-architecture.ts` models the foundation, service routes, reserved bays, and glazing. The preview query `shell=A` shows the open shell and `shell=B` adds the deeper smoked-glass enclosure. The default is the hybrid shell.
- `studio-model.ts` derives materials from portfolio tokens, rounds and batches opaque geometry, and creates the local contact shading and nameplates. Transparent panes stay separate for depth sorting.
- `studio-light.ts` creates a small prefiltered environment map once, with a warm key light and restrained fill. The preview queries `light=soft` and `light=rim` show the alternative light rigs.
- `station-learning.ts` contains the sensor manifold, transparent chamber, encoder rotor, compute modules, forecast panes and conduit paths. Its data particles are instanced. The visible forecast shapes are illustrative and carry no measured values.
- `agentic-machinery.ts` models the archive, horizontal optical vault, distinct processing units, verification gate, and output tray. The hybrid combines a three-tier archive with a wider chamber. The preview queries `agentic=mechanical` and `agentic=optical` show the two alternative compositions.
- `station-agentic.ts` sets the timing, connects the machine ports with 3D curves, and animates the document plates, instanced query signals, clustered embeddings, and cited output layers. The query uses the nearest illustrative cluster. Swa.Neeti inspired the evidence check. The floor handoff represents a conceptual connection between disciplines.
- `studio-runtime.ts` handles camera framing, rendering, and resource disposal. `ResearchStudio.tsx` handles inspection by pointer, touch, and keyboard. The overview samples the Agentic animation at 12 updates per second with fewer particles. Focusing a station enables its detailed sequence and pauses the other station. Finance and Systems & Robotics remain reserved.

The models are generated from editable Three.js geometry. The three WebP files are renders of the same scene for browsers without WebGL. The preview query `still=1` freezes the process for captures.

## Agentic modeling references

- Slotted archive trays and the rail-fed picker draw on automated library retrieval and high-density storage. [Dematic library case study](https://www.dematic.com/en-us/insights/case-studies/university-of-chicago-library/) and [ReCAP storage system](https://recap.princeton.edu/facility-storage/storage-system).
- The vault borrows the fixed guide and moving carriage arrangement of optical translation stages. The compact computing units use stacked equipment, visible ports, and cable routing from server racks. [Thorlabs translation stages](https://www.thorlabs.com/Images/PDF/Vol18_226.pdf) and [Google Cloud data center racks](https://services.google.com/fh/files/misc/google_cloud_pipeda_canada.pdf).
- The implementation uses repeated editable geometry, instanced particles, distance-based curve sampling, and a sectional camera for inspection. [Blender instancing manual](https://docs.blender.org/manual/en/latest/modeling/geometry_nodes/instances.html), [Three.js instancing](https://threejs.org/docs/pages/InstancedMesh.html), [Three.js curves](https://threejs.org/docs/pages/Curve.html), and [Codrops Interactive Room Display](https://tympanus.net/codrops/2015/11/10/interactive-room-display/).
