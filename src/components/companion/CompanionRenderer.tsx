import { CompanionRendererProps } from "./companion.types";
import { CompanionPlaceholder } from "./CompanionPlaceholder";
import { IllustratedCompanionRenderer } from "./IllustratedCompanionRenderer";

// TODO: When Rive asset is ready, import FutureRiveRenderer here.
// import { FutureRiveRenderer } from "./FutureRiveRenderer";
//
// The Rive implementation will use the following mapped props:
// stateIndex: COMPANION_STATE_INDEX[props.state]
// direction: props.direction === "left" ? -1 : 1
// intensity: props.intensity
// Optional triggers: surprise, inspect, wave

export const CompanionRenderer = (props: CompanionRendererProps) => {
  // Config toggle or check if asset exists
  const useRive = false;

  if (useRive) {
    // const stateIndex = COMPANION_STATE_INDEX[props.state];
    // const numericDirection = props.direction === "left" ? -1 : 1;
    // return <FutureRiveRenderer stateIndex={stateIndex} direction={numericDirection} intensity={props.intensity} />;
    return <CompanionPlaceholder {...props} />;
  }

  // Use IllustratedRenderer for V1 Phase 2E
  return <IllustratedCompanionRenderer {...props} />;
};
