import { ArrowRight, RotateCcw } from "lucide-react";
import { scenarioIds, studioScenarios, type ScenarioId, type StudioActivity } from "./studio-choreography";
import { stationDetails } from "./studio-plan";
import styles from "./ResearchStudio.module.css";

export function StudioConnections({ id, activity, ready, select, stop }: {
  id: ScenarioId;
  activity: StudioActivity | null;
  ready: boolean;
  select: (id: ScenarioId) => void;
  stop: () => void;
}) {
  const scenario = studioScenarios[id];
  const step = activity?.beat?.guided && activity.beat.id === id ? scenario.beats[activity.beat.index] : null;
  const completed = activity?.completed;
  const staticView = !ready || activity?.paused;
  return (
    <aside id="studio-connections" aria-label="Interdisciplinary connections" className={styles.connections} data-familiar-protect data-familiar-yield>
      <div className={styles.scenarioChoices} role="group" aria-label="Choose a connection">
        {scenarioIds.map(key => <button className={styles.scenario} key={key} type="button" aria-pressed={key === id}
          data-scenario={key} onClick={() => select(key)}>{studioScenarios[key].title}</button>)}
      </div>
      <div className={styles.connectionBody}>
        <div>
          <div className={styles.routeNames}>
            <span>{stationDetails[scenario.pair[0]].control}</span>
            <ArrowRight size={13} aria-hidden />
            <span>{stationDetails[scenario.pair[1]].control}</span>
          </div>
          <p>{scenario.summary}</p>
        </div>
        <div className={styles.guideState}>
          <span role="status">{staticView ? "Illustrative route" : step?.label ?? (completed ? "Sequence complete" : "Preparing the lab")}</span>
          {!staticView && (completed
            ? <button className={styles.sequenceAction} type="button" onClick={() => select(id)}><RotateCcw size={12} aria-hidden />Replay</button>
            : <button className={styles.sequenceAction} type="button" onClick={stop}>Stop sequence</button>)}
        </div>
      </div>
    </aside>
  );
}
