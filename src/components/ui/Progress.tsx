"use client";

import { STAGES } from "@/lib/journey";
import { useJourney } from "@/store/useJourney";

export function ProgressRail() {
  const progress = useJourney((s) => s.progress);
  const active =
    progress < 0.33 ? 0 : progress < 0.5 ? 1 : progress < 0.64 ? 2 : progress < 0.8 ? 3 : 4;
  const pct = Math.round(progress * 100)
    .toString()
    .padStart(2, "0");

  return (
    <aside className="progress-rail" aria-label="Journey progress">
      <div className="progress-track">
        <div className="progress-fill" style={{ height: `${progress * 100}%` }} />
      </div>
      <ol>
        {STAGES.map((stage, i) => (
          <li key={stage.id} className={i === active && progress > 0.14 ? "is-active" : ""}>
            <span className="stage-num">{String(stage.index).padStart(2, "0")}</span>
            <span className="stage-label">{stage.label}</span>
          </li>
        ))}
      </ol>
      <div className="progress-pct">{pct}</div>
    </aside>
  );
}
