"use client";

import React from 'react';
import { ThriveForceEntry } from './ThriveForceEntry';
import { ThriveForceEngineering } from './ThriveForceEngineering';
import { ThriveForceTeam } from './ThriveForceTeam';

export const ThriveForceSection = () => {
  return (
    <section id="robotics" className="relative w-full bg-[#030303] text-white">
      {/* 01 & 02: Cinematic Intro, Machine, Weapon & Impact */}
      <ThriveForceEntry />
      
      {/* 03 & 04: FEA & Powertrain */}
      <ThriveForceEngineering />
      
      {/* 05 to 09: Team, Robots, Role, Milestones, Sponsors, Close */}
      <ThriveForceTeam />
    </section>
  );
};
