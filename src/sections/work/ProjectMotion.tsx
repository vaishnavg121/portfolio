"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { expenseExample } from "../research-studio/markets-math";
import "./project-studies.css";

const sceneInfo = {
  imdpune: {
    caption: "Runway observations → visibility forecast",
    description: "Illustrative aviation visibility forecast. Three runway observations pass through preprocessing into a historical trace and a forecast curve.",
    tone: "#a8bfca",
  },
  swaneeti: {
    caption: "Question → source retrieval → citation check",
    description: "Illustrative legal search. A question retrieves relevant passages and ranks authorities before checking their citations against the source records.",
    tone: "#c6a0ad",
  },
  windy: {
    caption: "Sensor analytics → pattern discovery",
    description: "Illustrative weather analysis. Wind vectors frame raw observations, which are grouped and shown in a two-dimensional PCA projection.",
    tone: "#aac4ba",
  },
  spenza: {
    caption: "Expense → allocation → balanced ledger",
    description: "Illustrative expense split in minor units. A debit of 1200 and credits of 500, 400 and 300 leave a zero-sum ledger.",
    tone: "#d2b38f",
  },
} as const;

export type SceneId = keyof typeof sceneInfo;
const range = (count: number) => Array.from({ length: count }, (_, index) => index);
const random = (seed: number) => {
  // Integer hashing keeps the server's SVG coordinates identical in other JS engines.
  let value = Math.imul(seed + 17, 0x85ebca6b);
  value = Math.imul(value ^ (value >>> 13), 0xc2b2ae35);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
};
const clouds = range(125).map(i => ({
  x: 20 + random(i + 6) * 596,
  y: 114 + random(i + 169) * random(i + 169) * 116,
  radius: .4 + random(i + 280) * 1.85,
  alpha: .14 + random(i + 388) * .44,
}));
const groups = [
  { x: 435, y: 213, color: "var(--study-tone)", cos: .868, sin: -.497 },
  { x: 541, y: 138, color: "var(--accent-stone)", cos: .943, sin: .333 },
  { x: 548, y: 245, color: "var(--accent-petal)", cos: .986, sin: -.169 },
];
const observations = range(72).map(i => {
  const group = groups[i % groups.length];
  const along = (random(88 + i) - .5) * 74;
  const across = (random(182 + i) - .5) * 43;
  return {
    startX: 53 + random(444 + i) * 240, startY: 100 + random(272 + i) * 152,
    x: group.x + along * group.cos - across * group.sin,
    y: group.y + along * group.sin + across * group.cos,
    color: group.color, size: 1.05 + random(333 + i) * 1.7,
  };
});

function Instrument({ x,y,width,height,uid,children }: {
  x:number; y:number; width:number; height:number; uid:string; children?:React.ReactNode;
}) {
  return <g transform={`translate(${x} ${y})`} className="study-instrument">
    <path d={`M0 ${height-2} H${width-1} V5 L${width+8} 12 V${height+4} L${width} ${height+10} H7Z`}
      fill="var(--study-metal)" stroke="var(--study-rim)" strokeWidth=".8" />
    <rect width={width} height={height} rx="8" fill={`url(#${uid}-glass)`} stroke="var(--study-rim)" />
    <path d={`M10 2 H${width-11}`} stroke="var(--text-primary)" strokeOpacity=".31" />
    {children}
  </g>;
}

function Packet({ route, offset }: { route:string; offset:number }) {
  return <circle r="2.8" className="study-packet" style={{"--packet-route":`path("${route}")`,"--packet-delay":offset+"s"} as CSSProperties}/>;
}

function Visibility({ uid }: { uid: string }) {
  return <>
    <defs>
      <linearGradient id={uid + "-air"} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="var(--study-tone)" stopOpacity="0" />
        <stop offset=".55" stopColor="var(--study-tone)" stopOpacity=".25" />
        <stop offset="1" stopColor="var(--study-tone)" stopOpacity="0" />
      </linearGradient>
      <linearGradient id={uid + "-forecast"} x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="var(--accent-stone)" stopOpacity=".19" />
        <stop offset="1" stopColor="var(--accent-stone)" stopOpacity=".03" />
      </linearGradient>
    </defs>
    <path d="M0 110 Q167 95 300 112T640 98 V237 Q464 267 302 223T0 237Z" fill={"url(#" + uid + "-air)"} className="study-air" />
    <g className="study-air" fill="var(--study-tone)">
      {clouds.map(({x,y,radius,alpha}, i)=><circle key={i} cx={x} cy={y} r={radius} opacity={alpha} />)}
    </g>
    <path d="M73 330 L235 151 H261 L369 330 Z" fill="var(--study-tone)" fillOpacity=".055" />
    <path d="M73 330 L235 151 M369 330 L261 151" className="study-line" opacity=".68" />
    <path d="M220 329 L248 152" className="study-line" strokeDasharray="11 9" opacity=".46" />
    <path d="M125 319 H339 M161 280 H325 M192 243 H314 M218 205 H294 M237 174 H276" className="study-grid" />
    <g className="study-sensors">
      {[[116,282],[188,213],[290,248]].map(([x,y],i)=><g key={i} style={{"--delay":1.1+i*.19} as CSSProperties}>
        <path d={`M${x} ${y+39} V${y} L330 144`} className="study-grid study-trace" pathLength="1" />
        <circle cx={x} cy={y} r="10" fill="none" stroke="var(--study-tone)" opacity=".36" />
        <circle cx={x} cy={y} r="3.5" fill="var(--study-tone)" />
      </g>)}
    </g>
    <Instrument x={287} y={131} width={39} height={35} uid={uid}>
      <path d="M9 11 H29 M9 17 H29 M9 23 H25" className="study-grid" />
    </Instrument>
    <Packet route="M116 282 L300 148 H329" offset={1.02} />
    <Packet route="M188 213 L300 148 H329" offset={1.29} />
    <Instrument x={326} y={82} width={287} height={213} uid={uid}/>
    <g className="study-forecast">
      <path d="M333 110 V285 H604 M333 166 H604 M333 214 H604 M333 250 H604 M478 112 V285" className="study-grid" />
      <path d="M478 213 C507 190 537 220 566 182 S599 166 604 167 L604 207 C575 204 575 223 549 232 S502 224 478 213Z" fill={"url(#" + uid + "-forecast)"} />
      <path d="M333 253 C361 252 363 210 390 228 S428 199 442 216 S461 229 478 213" className="study-line study-trace" pathLength="1" />
      <path d="M478 213 C510 195 535 222 566 188 S593 183 604 183" className="study-line study-trace study-emphasis" pathLength="1" />
      <text x="338" y="102" className="study-text">Observed</text>
      <text x="484" y="102" className="study-text study-emphasis">Forecast</text>
    </g>
  </>;
}

function Legal({ uid }: { uid: string }) {
  const documents = [
    { x: 57, y: 71, angle: -9, used: false },
    { x: 135, y: 85, angle: 8, used: true },
    { x: 217, y: 100, angle: 8, used: true },
    { x: 55, y: 185, angle: 4, used: true },
    { x: 135, y: 205, angle: -6, used: false },
    { x: 218, y: 210, angle: 5, used: false },
  ];
  return <>
    <defs>
      <linearGradient id={uid + "-paper"} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="var(--study-tone)" stopOpacity=".20" />
        <stop offset="1" stopColor="var(--study-tone)" stopOpacity=".045" />
      </linearGradient>
    </defs>
    <Instrument x={40} y={61} width={259} height={248} uid={uid}/>
    <Instrument x={357} y={74} width={246} height={216} uid={uid}/>
    <g className="study-query">
      <text x="57" y="50" className="study-text">Query</text>
      <path d="M110 45 H290 C318 45 316 84 290 98" className="study-line study-trace" pathLength="1" />
    </g>
    {documents.map(({x,y,angle,used},i)=><g key={i} transform={`translate(${x} ${y}) rotate(${angle} 39 48)`}>
      <g className="study-document" style={{"--delay":.28+i*.1} as CSSProperties}>
        <path d="M0 0 H51 L73 22 V96 H0Z M51 0 V22 H73" className="study-grid" fill={"url(#" + uid + "-paper)"} />
        <path d="M11 25 H39 M11 41 H58 M11 51 H58 M11 61 H51 M11 71 H58 M11 81 H43" className="study-grid" />
        {used&&<path d="M10 51 H59 M10 61 H52" className="study-line study-excerpt" />}
      </g>
    </g>)}
    <g className="study-retrieval">
      <path d="M197 132 C293 93 292 153 373 145 M280 147 C324 147 312 201 373 194 M122 241 C285 283 294 240 373 243" className="study-line study-trace" pathLength="1" />
      <text x="395" y="102" className="study-text">Ranked authorities</text>
      {[145,194,243].map((y,i)=><g key={y}>
        <circle cx="374" cy={y} r="4" fill="var(--study-tone)" />
        <path d={`M389 ${y-10} H${572-i*13} M389 ${y} H${541-i*16} M389 ${y+10} H${557-i*9}`} className="study-grid" />
      </g>)}
    </g>
    <g className="study-validation">
      <path d="M579 136 H592 V253 H579 M592 195 C606 195 605 290 570 290 H368" className="study-line study-trace study-emphasis" pathLength="1" />
      <path d="M371 316 l6 6 l12 -14" className="study-line study-emphasis" />
      <text x="403" y="322" className="study-text study-emphasis">Citation check</text>
    </g>
    <Packet route="M197 132 C293 93 292 153 373 145" offset={1.40} />
    <Packet route="M122 241 C285 283 294 240 373 243" offset={1.62} />
  </>;
}

function Windy({ uid }: { uid: string }) {
  return <>
    <defs>
      <linearGradient id={uid + "-wind"}>
        <stop stopColor="var(--study-tone)" stopOpacity="0" />
        <stop offset=".46" stopColor="var(--study-tone)" />
        <stop offset="1" stopColor="var(--study-tone)" stopOpacity="0" />
      </linearGradient>
    </defs>
    <Instrument x={30} y={43} width={298} height={253} uid={uid}/>
    <Instrument x={370} y={43} width={243} height={253} uid={uid}/>
    <text x="53" y="66" className="study-text">Observation field</text>
    <g className="study-vectors">
      {range(9).map(i=>{
        const y=90+i*22;
        return <path key={i} d={`M38 ${y} C128 ${y+52} 184 ${y-72} 324 ${y-9}`} pathLength="1"
          fill="none" stroke={"url(#" + uid + "-wind)"} strokeWidth="1.4" opacity={.25+i*.055}
          className="study-trace" style={{"--delay":.24+i*.1} as CSSProperties} />;
      })}
      {observations.map(({startX,startY,size},i)=>
        <circle key={i} cx={startX} cy={startY} r={size*.72} fill="var(--study-tone)" opacity={.35+random(i)*.35}/>)}
    </g>
    <path d="M321 172 H359 M351 165 L359 172 L351 179" className="study-line study-emphasis" />
    <Packet route="M289 172 H369" offset={.81} />
    <g className="study-projection">
      <text x="377" y="66" className="study-text">PCA projection</text>
      <path d="M378 87 V292 H605 M378 126 H605 M378 167 H605 M378 208 H605 M378 249 H605 M425 87 V292 M470 87 V292 M515 87 V292 M560 87 V292" className="study-grid" />
      {[{x:435,y:213,w:46,h:23,a:-26},{x:541,y:138,w:45,h:24,a:18},{x:548,y:245,w:45,h:25,a:-13}].map(({x,y,w,h,a},i)=>
        <ellipse key={i} cx={x} cy={y} rx={w} ry={h} transform={`rotate(${a} ${x} ${y})`} fill={groups[i].color} fillOpacity=".09" stroke={groups[i].color} strokeOpacity=".35" strokeDasharray="3 4" />)}
      {observations.map(({startX,startY,x,y,color,size},i)=><g key={i} transform={`translate(${x} ${y})`}>
        <circle r={size} fill={color} className="study-projected-point"
          style={{"--from-x":(startX-x)*.71+"px","--from-y":(startY-y)*.71+"px","--delay":1.34+random(i)*.59} as CSSProperties}/>
      </g>)}
    </g>
  </>;
}

function Ledger({uid}: {uid:string}) {
  const {total,credits}=expenseExample;
  const colors=["var(--study-tone)","var(--accent-petal)","var(--accent-mauve)"];
  const amounts=credits.map((value,index)=>({value,y:103+index*89,color:colors[index]}));
  const balance=credits.reduce<number>((amount,credit)=>amount+credit,-total);
  return <>
    <Instrument x={34} y={65} width={149} height={197} uid={uid}/>
    <Instrument x={466} y={55} width={140} height={250} uid={uid}/>
    <text x="49" y="94" className="study-text">Transaction</text>
    <text x="49" y="207" className="study-value">{total}</text>
    <text x="49" y="252" className="study-unit">minor units</text>
    <path d="M47 226 H176 M167 218 L176 226 L167 234" className="study-line study-trace" pathLength="1" />
    {amounts.map(({ value,y,color },i)=><g key={value}>
      <path d={`M177 226 C255 226 242 ${y} 322 ${y} S407 ${y} 460 ${y}`}
        fill="none" stroke={color} strokeWidth={8-i*1.65} strokeLinecap="round" opacity=".14" />
      <path d={`M177 226 C255 226 242 ${y} 322 ${y} S407 ${y} 460 ${y}`}
        fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" pathLength="1"
        className="study-trace study-allocation" style={{"--delay":.54+i*.22} as CSSProperties} />
      <circle cx="344" cy={y} r="6" fill="var(--background)" stroke={color} />
      <text x="344" y={y-15} textAnchor="middle" className="study-text">{value}</text>
      <Packet route={`M177 226 C255 226 242 ${y} 322 ${y} S407 ${y} 460 ${y}`} offset={.58+i*.27}/>
    </g>)}
    <g className="study-reconcile">
      <text x="487" y="78" className="study-text">Ledger</text>
      <path d="M474 95 V299 M594 95 V299 M475 127 H596 M474 163 H596 M474 200 H596 M474 237 H596 M474 274 H596" className="study-grid" />
      {["−"+total,...credits.map(credit=>"+"+credit),String(balance)].map((value,i)=>
        <text key={value} x="575" y={117+i*36.8} textAnchor="end" className={i===4?"study-emphasis study-text":"study-text"}>{value}</text>)}
      <path d="M489 291 l6 6 11 -13" className="study-line study-emphasis" />
      <text x="474" y="331" className="study-text study-emphasis">Balance = {balance}</text>
    </g>
  </>;
}

export function ProjectMotion({ slug, active, reduced }: { slug: string; active: boolean; reduced: boolean }) {
  const uid = useId();
  const [generation, setGeneration] = useState(0);
  const info = sceneInfo[slug as SceneId];
  if (!info) return null;
  const Scene = slug === "imdpune" ? Visibility : slug === "swaneeti" ? Legal : slug === "windy" ? Windy : Ledger;
  return (
    <figure className="project-study" data-playing={active && !reduced || undefined} style={{"--study-tone":info.tone} as CSSProperties}>
      <svg key={generation} viewBox="0 0 640 360" role="img" aria-labelledby={uid + "-description"}>
        <title id={uid + "-description"}>{info.description}</title>
        <defs>
          <linearGradient id={uid+"-glass"} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="var(--study-glass)" />
            <stop offset=".48" stopColor="var(--surface)" stopOpacity=".84" />
            <stop offset="1" stopColor="var(--background)" stopOpacity=".91" />
          </linearGradient>
        </defs>
        <Scene uid={uid} />
      </svg>
      <figcaption>
        <div><span className="study-caption">{info.caption}</span><span className="study-disclosure">Illustrative sequence</span></div>
        <button type="button" disabled={!active} onClick={()=>setGeneration(value=>value+1)}
          className="study-replay portfolio-control" aria-label="Replay project animation" title="Replay animation">
          <RotateCcw size={15} aria-hidden="true" />
        </button>
      </figcaption>
    </figure>
  );
}

export function ProjectCoverVisual({ slug }: {slug:SceneId}) {
  const cover = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    if (!cover.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry])=>setActive(entry.isIntersecting),{threshold:.30});
    observer.observe(cover.current);
    return ()=>observer.disconnect();
  },[]);
  return <div ref={cover} className="case-study-visual" data-familiar-protect data-familiar-yield>
    <ProjectMotion slug={slug} active={active} reduced={Boolean(reduceMotion)} />
  </div>;
}
