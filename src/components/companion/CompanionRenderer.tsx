import { CompanionRendererProps } from "./companion.types";
import { CompanionPlaceholder } from "./CompanionPlaceholder";

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

  return <CompanionPlaceholder {...props} />;
};
