"use client";

import { useId, useState, type CSSProperties } from "react";
import { technicalFlows } from "./technical-flows";
import "./technical-flow.css";

export function TechnicalFlow({ id }: { id: keyof typeof technicalFlows }) {
  const flow = technicalFlows[id];
  const uid = useId();
  const [selected, setSelected] = useState({ lane: 0, step: 0 });
  const active = flow.lanes[selected.lane][selected.step];
  return (
    <figure className="technical-flow" data-technical-flow={id} aria-labelledby={uid+"-title"} data-familiar-protect>
      <figcaption id={uid+"-title"}>{flow.title}</figcaption>
      <ol className="technical-lanes" style={{"--lanes":flow.lanes.length} as CSSProperties}>
        {flow.lanes.map((lane,laneIndex) => (
          <li key={lane[0][0]} className="technical-lane" data-branches={lane.length>1 || undefined} data-current={laneIndex===selected.lane || undefined}>
            <ul>
              {lane.map(([label],stepIndex) => (
                <li key={label}>
                  <button type="button" className="technical-step" aria-pressed={laneIndex===selected.lane && stepIndex===selected.step}
                    aria-controls={uid+"-detail"} onClick={() => setSelected({lane:laneIndex,step:stepIndex})}>
                    <span className="technical-port" aria-hidden />{label}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
      <div id={uid+"-detail"} className="technical-detail" aria-live="polite">
        <strong>{active[0]}</strong><p>{active[1]}</p>
      </div>
    </figure>
  );
}
