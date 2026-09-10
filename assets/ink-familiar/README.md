# The Ink Familiar - SVG Master

This file (`ink-familiar-master.svg`) is the canonical vector master for the Ink Familiar mascot, prepared for future rigging and animation in Rive.

## Group Hierarchy

The SVG is carefully structured with semantic grouping to support Rive deformation:

- **InkFamiliar** (Root)
  - **Ink** (Background wisps and tail, flows behind the body)
    - `Tail_Main`, `Wisp_01`, `Wisp_02`, `Wisp_03`, `Droplet_01`, `Droplet_02`, `Droplet_03`
  - **Body** (Core torso and paws)
    - `Hindpaw_R`, `Hindpaw_L`
    - `Torso`
    - `Forepaw_R`, `Forepaw_L`
  - **Scarf** (Sits between Body and Head)
    - `Scarf_Tail_02`, `Scarf_Tail_01`, `Scarf_Neck`
  - **Head** (Foreground head features)
    - `Ear_L` (Viewer's right, character's left)
    - `Head_Ink` (Base head silhouette)
    - `Ear_R` (Viewer's left, character's right)
    - `Face_Cream` (Heart-shaped cream face)
    - `Eye_R`, `EyeHighlight_R` (Viewer's left eye)
    - `Eye_L`, `EyeHighlight_L` (Viewer's right eye)
    - `Mouth`
  - **Props** (Hidden by default, used for specific animation states)
    - `Notebook` (Used for READ state)
    - `MagnifyingGlass` (Used for INSPECT state)

## Rigging & Pivot Intentions

When setting up bones in Rive, use the following logic:

- **Root Bone:** Placed at the base of the `Torso` (around the hips).
- **Spine/Neck:** A bone originating from the torso pointing up to control the `Head` group.
- **Ears (`Ear_L`, `Ear_R`):** Pivot at the base where they intersect `Head_Ink`. They are drawn overlapping into the head to allow clean rotation without gaps.
- **Scarf (`Scarf_Neck`, `Scarf_Tail_01`, `Scarf_Tail_02`):** `Scarf_Neck` deforms slightly with neck movement. Scarf tails pivot from the right side of the neck.
- **Limbs (`Forepaw_L/R`, `Hindpaw_L/R`):** Pivot near their intersections with the `Torso`.
- **Ink Tail & Wisps:** Should use a bone chain or path constraints for fluid, secondary motion. `Tail_Main` pivots from the lower rear of the body.
- **Face:** The face elements (`Face_Cream`, `Eyes`, `Mouth`) can be grouped under a control point for slight parallaxing against `Head_Ink` to simulate 3D rotation.

## Recommended Draw Order

The SVG groups are already ordered back-to-front:
1. `Ink` (Furthest back)
2. `Body`
3. `Scarf`
4. `Head`
5. `Props` (Furthest front when visible)

## Rive Import Steps

1. Drag and drop `ink-familiar-master.svg` into Rive.
2. Ensure the group hierarchy is maintained.
3. Convert paths to custom shapes if fine deformation/vertex weighting is required (especially for `Tail_Main` and `Face_Cream`).
4. Set up the bone hierarchy according to the pivot intentions above.
5. Bind vertices for the ears and tail to bone chains.

## Color Palette

- **Ink:** `#1A1A1A`
- **Charcoal:** `#2D2D2D`
- **Cream:** `#F5EDE3`
- **Crimson:** `#B22234`
- **Mist:** `#6B6B6B`
