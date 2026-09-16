"use client";

import React from 'react';
import { ThriveForceEntry } from './ThriveForceEntry';
import { ThriveForceWeapon } from './ThriveForceWeapon';
import { ThriveForceEngineering } from './ThriveForceEngineering';
import { ThriveForceTeam } from './ThriveForceTeam';

export const ThriveForceSection = () => {
  return (
    <section className="relative w-full bg-[#030303] text-white">
      {/* 01 & 02: Cinematic Intro & Machine */}
      <ThriveForceEntry />
      
      {/* 03 & 04: Weapon & Impact */}
      <ThriveForceWeapon />
      
      {/* 05 & 06: FEA & Powertrain */}
      <ThriveForceEngineering />
      
      {/* 07 to 12: Team, Robots, Role, Milestones, Sponsors, Close */}
      <ThriveForceTeam />
    </section>
  );
};
