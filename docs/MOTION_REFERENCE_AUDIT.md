# MOTION REFERENCE AUDIT

## JOBENETUK.DEV
- **Interaction Principle**: Proximity-based physics and playful cursor responsiveness.
- **Motion Principle**: Inertia, lag, and physical weighting. Elements don't just scale; they drag and settle.
- **Applicable**: Environmental lag layers, magnetic CTA physics, surprising but brief micro-interactions.
- **Avoid**: Replicating specific graphic motifs or overriding the entire layout with a physics engine.
- **Concrete Ideas**: 
  1. Add semantic lag tiers (foreground fast, background slow) to pointer tracking.
  2. Improve the Ink Familiar's arrival so it physically settles (tiny 1-3px 150ms settle) rather than stopping artificially.

## IVERSON.INC
- **Interaction Principle**: Strong momentum and editorial pacing.
- **Motion Principle**: Seamless section handoffs where the incoming section responds *before* the outgoing section finishes exiting.
- **Applicable**: Section transitions, large editorial reveals, fluid continuous scroll.
- **Avoid**: Giant fullscreen takeovers for every section that disrupt reading.
- **Concrete Ideas**: 
  1. Overlap GSAP ScrollTriggers so motion hands off smoothly (Section A exits down, Section B enters up simultaneously).
  2. Project visual depth (foreground/background elements moving at different rates during parallax).

## JAYENDRA-PATEL.VERCEL.APP
- **Interaction Principle**: Deep technical interaction.
- **Motion Principle**: Information hierarchy dictating motion hierarchy.
- **Applicable**: Presenting activity data (like GitHub) and project pipelines cleanly.
- **Avoid**: Copying claims or personal layout structures.
- **Concrete Ideas**: 
  1. Hovering the GitHub contribution cell provides precise, stable, inspectable data. The Familiar should respect this stability.
  2. System pipelines (AlphaCouncil) should respond logically, not randomly.

## ARJUNR.DEV
- **Interaction Principle**: Personality-driven easter eggs.
- **Motion Principle**: Interactive objects that feel alive but aren't noisy.
- **Applicable**: The Ink Familiar, Command Palette.
- **Avoid**: Making the site too casual or overwhelming it with gimmicks.
- **Concrete Ideas**: 
  1. The Ink Familiar should have intentional behaviors (waving, inspecting, sleeping) rather than NPC wandering.
  2. Command palette opening with a fast, origin-based scale/mask rather than a generic fade.

## DANIELWHITE.UK
- **Interaction Principle**: Typography-layout symbiosis.
- **Motion Principle**: Restrained motion pacing that respects composition.
- **Applicable**: Typography entering/leaving, loader composition.
- **Avoid**: Over-minimalism that loses the cyber/Japanese-ink edge.
- **Concrete Ideas**: 
  1. Loader should feel premium (tabular numbers, clean layout) rather than a loading bar stretched across the screen.
  2. Route transitions should use typography as a structural anchor.

## MITTALPARTH.DEV
- **Interaction Principle**: High interaction density.
- **Motion Principle**: Confident transitions between portfolio states.
- **Applicable**: View Project button to route transition flow.
- **Avoid**: Confusing navigation traps.
- **Concrete Ideas**: 
  1. Clicking a project shouldn't play an unrelated exit; it should accelerate the user into the route.

