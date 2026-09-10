import fs from "fs";
import path from "path";

const PUBLIC_DIR = path.join(process.cwd(), "public");

const ASSETS = [
  { path: "/assets/mascot/vaishnav-companion.riv", type: "OPTIONAL", desc: "Mascot File" },
  { path: "/assets/textures/paper-noise.webp", type: "GLOBAL", desc: "Paper Noise Texture" },
  { path: "/assets/effects/slash-brush.svg", type: "GLOBAL", desc: "Slash Brush Mask" },
  { path: "/assets/effects/ink-mask.svg", type: "GLOBAL", desc: "Ink Mask" },

  // AlphaCouncil
  { path: "/assets/projects/alphacouncil/hero.webp", type: "PROJECT", desc: "AlphaCouncil Hero" },
  { path: "/assets/projects/alphacouncil/diagram.svg", type: "PROJECT", desc: "AlphaCouncil Diagram" },

  // Swa.Neeti
  { path: "/assets/projects/swaneeti/hero.webp", type: "PROJECT", desc: "Swa.Neeti Hero" },
  { path: "/assets/projects/swaneeti/diagram.svg", type: "PROJECT", desc: "Swa.Neeti Diagram" },

  // Windy
  { path: "/assets/projects/windy/hero.webp", type: "PROJECT", desc: "Windy Hero" },
  { path: "/assets/projects/windy/diagram.svg", type: "PROJECT", desc: "Windy Diagram" },

  // Spenza
  { path: "/assets/projects/spenza/hero.webp", type: "PROJECT", desc: "Spenza Hero" },
  { path: "/assets/projects/spenza/diagram.svg", type: "PROJECT", desc: "Spenza Diagram" },

  // ThriveForce
  { path: "/assets/projects/thriveforce/hero.webp", type: "PROJECT", desc: "ThriveForce Hero" },
  { path: "/assets/projects/thriveforce/diagram.svg", type: "PROJECT", desc: "ThriveForce Diagram" },
];

console.log("=========================================");
console.log("       ASSET PIPELINE VALIDATION         ");
console.log("=========================================");

let missingCount = 0;
let presentCount = 0;

ASSETS.forEach(asset => {
  const fullPath = path.join(PUBLIC_DIR, asset.path);
  const exists = fs.existsSync(fullPath);

  if (exists) {
    console.log(`[ PRESENT ] ${asset.desc.padEnd(25)} : ${asset.path}`);
    presentCount++;
  } else {
    console.log(`[ MISSING ] ${asset.desc.padEnd(25)} : ${asset.path} (OPTIONAL fallback active)`);
    missingCount++;
  }
});

console.log("=========================================");
console.log(`TOTAL PRESENT: ${presentCount}`);
console.log(`TOTAL MISSING: ${missingCount}`);
console.log("Site will safely render procedural fallbacks for missing assets.");
