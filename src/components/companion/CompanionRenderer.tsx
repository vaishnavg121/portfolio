import { CompanionRendererProps } from "./companion.types";
import { CompanionPlaceholder } from "./CompanionPlaceholder";

// TODO: When Rive asset is ready, import FutureRiveRenderer here.
// import { FutureRiveRenderer } from "./FutureRiveRenderer";

export const CompanionRenderer = (props: CompanionRendererProps) => {
  // Config toggle or check if asset exists
  const useRive = false;

  if (useRive) {
    // return <FutureRiveRenderer {...props} />;
    return <CompanionPlaceholder {...props} />;
  }

  return <CompanionPlaceholder {...props} />;
};
