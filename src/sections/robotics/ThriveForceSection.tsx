"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import styles from "./ThriveForceSection.module.css";

const views = [
  {
    id: "robot",
    label: "Robot",
    title: "Velociraptor",
    description: "Velociraptor was the design I worked on with ThriveForce. I helped take it from CAD through simulation and fabrication.",
  },
  {
    id: "analysis",
    label: "Analysis",
    title: "Checking the design",
    description: "I used finite element analysis to review how the chassis responded to different loads. Design and FEA validation were part of the 2024 project.",
  },
  {
    id: "team",
    label: "Team",
    title: "Engineering and treasury",
    description: "I worked on CAD, simulation and fabrication as an engineer, and managed budgeting, procurement and sponsorship as treasurer.",
  },
] as const;

export function ThriveForceSection() {
  const [selected, setSelected] = useState<(typeof views)[number]["id"]>("robot");
  const view = views.find(item => item.id === selected)!;

  return (
    <section id="robotics" className={`portfolio-chapter chapter-divider ${styles.section}`} aria-labelledby="thriveforce-title">
      <div className="portfolio-frame">
        <div className={styles.composition}>
          <header className={styles.intro}>
            <p className={styles.role}>Engineer and Treasurer · BITS Pilani Hyderabad</p>
            <h2 id="thriveforce-title" className="chapter-heading">ThriveForce</h2>
            <p>ThriveForce is my campus combat robotics team. I worked on Velociraptor and helped manage the budget and procurement that got our designs built.</p>
          </header>
          <figure className={styles.visual} data-familiar-avoid>
            <Image src="/assets/robotics/velociraptor/renders/velociraptor-main.png"
              alt="Three-quarter exterior CAD rendering of the Velociraptor robot" fill
              sizes="(min-width: 64rem) 55vw, 94vw" />
          </figure>
          <div className={styles.inspection}>
            <div className={styles.controls} role="group" aria-label="Explore ThriveForce">
              {views.map(option => (
                <button key={option.id} className="portfolio-control" type="button" aria-pressed={option.id === selected}
                  aria-controls="thriveforce-view" onClick={() => setSelected(option.id)}>{option.label}</button>
              ))}
            </div>
            <div id="thriveforce-view" aria-live="polite" aria-atomic="true" className={styles.readout}>
              <div key={view.id}>
                <h3>{view.title}</h3>
                <p>{view.description}</p>
              </div>
            </div>
            <details className={styles.context}>
              <summary>Team projects and sponsors <ChevronDown size={16} aria-hidden="true" /></summary>
              <p>Velociraptor joined the team’s earlier robots, A7X and Slipknut. Our sponsors included PCBWay, OnlyScrews and Technobotix.</p>
            </details>
          </div>
        </div>
      </div>
    </section>
  );
}
