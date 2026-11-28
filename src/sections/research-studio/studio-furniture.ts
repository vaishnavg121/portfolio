import {
  CatmullRomCurve3, CylinderGeometry, Group, Mesh, MeshBasicMaterial, SphereGeometry, TorusGeometry, TubeGeometry, Vector3,
  type Material,
} from "three";
import { modelGroup, placeShadow, type StudioMaterials } from "./studio-model";
import { studioScreen } from "./studio-interior-media";

function padded(parent: Group, material: Material, position: Vector3, dimensions: Vector3, rotation = 0) {
  const body = new SphereGeometry(1,24,14);
  const vertices = body.attributes.position;
  for (let i=0;i<vertices.count;i++) {
    const x=vertices.getX(i), y=vertices.getY(i), z=vertices.getZ(i);
    const shaped = (value:number) => Math.sign(value)*Math.pow(Math.abs(value),.63);
    const wrinkle = 1 + .025*Math.sin(x*15+z*10)*Math.pow(Math.abs(y),3);
    vertices.setXYZ(i,shaped(x)*dimensions.x/2,shaped(y)*dimensions.y/2*wrinkle,shaped(z)*dimensions.z/2);
  }
  body.computeVertexNormals();
  const mesh = new Mesh(body,material);
  mesh.position.copy(position);
  mesh.rotation.z = rotation;
  parent.add(mesh);
  return mesh;
}

function cable(parent: Group, material: Material, path: Vector3[], radius: number) {
  parent.add(new Mesh(new TubeGeometry(new CatmullRomCurve3(path),18,radius,5),material));
}

export function buildLounge(parent:Group,m:StudioMaterials,shadow:MeshBasicMaterial,x:number,z:number) {
  const nook = new Group(), sofa = new Group();
  nook.position.set(x,0,z);
  parent.add(nook);
  sofa.position.set(-.19,0,.52);
  sofa.rotation.y=2.81;
  nook.add(sofa);
  const cloth=m.satin(m.stone.clone().lerp(m.mauve,.38).lerp(m.night,.43),.97);
  const seam=m.satin(cloth.color.clone().lerp(m.ivory,.105),.92);
  const rose=m.satin(m.rose.clone().lerp(m.mauve,.23).lerp(m.night,.15),.96);
  const cream=m.satin(m.stone.clone().lerp(m.ivory,.32),.94);
  const wood=m.satin(m.stone.clone().lerp(m.night,.57),.62);
  const rug=m.satin(m.mauve.clone().lerp(m.night,.52),.99);
  const weave=m.satin(rug.color.clone().lerp(m.stone,.14),1);
  const pieces=modelGroup(nook), couchFrame=modelGroup(sofa);
  pieces.box(rug,-.02,.058,-.21,3.64,.019,2.54,.008);
  for(let i=0;i<30;i++) pieces.box(weave,-.02,.071,-1.38+i*.079,3.54,.003,.010,.001);
  for(const side of [-1,1]) {
    pieces.box(cream,side*1.76,.074,-.21,.016,.004,2.42,.001);
    for(const foot of [-1,1]) couchFrame.cylinder(m.metal,side*1.23,.119,foot*.41,.076,.174,12);
  }
  couchFrame.box(cloth,0,.40,0,2.85,.48,1.18,.225);
  couchFrame.box(cloth,0,.84,-.43,2.83,.80,.33,.16);
  for(const end of [-1,1]) couchFrame.box(cloth,end*1.28,.64,-.012,.38,.63,1.16,.178);
  const seats=[-.59,.59].map(offset=>{
    const seat = padded(sofa,cloth,new Vector3(offset,.625,.08),new Vector3(1.14,.255,.91));
    padded(sofa,seam,new Vector3(offset,.604,.095),new Vector3(1.15,.128,.93));
    padded(sofa,cloth,new Vector3(offset,.94,-.30),new Vector3(1.15,.66,.31),offset*.025);
    return seat;
  });
  padded(sofa,rose,new Vector3(-.83,1.01,-.154),new Vector3(.57,.56,.24),-.25).rotation.x=.12;
  padded(sofa,cream,new Vector3(.76,.89,-.095),new Vector3(.60,.47,.24),.21).rotation.x=.16;
  padded(sofa,weave,new Vector3(.37,.83,-.03),new Vector3(.42,.38,.20),-.12);
  couchFrame.build();
  placeShadow(nook,shadow,new Vector3(0,.076,.53),3.82,1.55);

  pieces.cylinder(wood,-.63,.449,-.68,.48,.101,24);
  pieces.cylinder(m.edge,-.63,.416,-.68,.444,.036,24);
  pieces.cylinder(m.metal,-.63,.26,-.68,.107,.344,16);
  pieces.cylinder(m.rubber,-.63,.109,-.68,.29,.076,18);
  pieces.box(m.rubber,-.677,.517,-.72,.35,.04,.255,.012);
  pieces.box(cream,-.66,.542,-.72,.318,.015,.222,.005);
  for(let i=0;i<4;i++) pieces.box(weave,-.661,.553,-.78+i*.041,.242-i*.011,.002,.006,.001);
  pieces.box(m.edge,-.40,.541,-.70,.018,.017,.239,.006);
  pieces.cylinder(m.metal,1.40,.131,-.82,.26,.065,18);
  pieces.cylinder(m.metal,1.40,.91,-.82,.039,1.53,12);
  pieces.piece(new CylinderGeometry(.24,.38,.42,24,1,true),cream,1.40,1.77,-.82);
  pieces.cylinder(m.lamp,1.40,1.60,-.82,.325,.024,22);
  pieces.cylinder(m.edge,1.40,1.98,-.82,.23,.029,22);
  pieces.build();
  placeShadow(nook,shadow,new Vector3(-.63,.079,-.68),1.37,1.23);
  const glow=new MeshBasicMaterial({color:m.rose.clone().lerp(m.ivory,.71),transparent:true,depthWrite:false,opacity:.20});
  const lamp = new Mesh(new SphereGeometry(.33,16,9),glow);
  lamp.scale.set(.95,.31,.95);
  lamp.position.set(1.40,1.58,-.82);
  nook.add(lamp);
  return (time:number,active:boolean)=>{
    seats[0].scale.y=active ? .945+.026*Math.sin(time*1.15) : 1;
    glow.opacity=.18+.03*Math.sin(time*1.08);
  };
}

export function buildDesk(parent: Group,m: StudioMaterials,shadow:MeshBasicMaterial,x:number,z:number) {
  const desk = new Group();
  desk.position.set(x,0,z);
  parent.add(desk);
  const wood=m.satin(m.stone.clone().lerp(m.night,.48),.63);
  const chair=m.satin(m.mauve.clone().lerp(m.night,.58),.94);
  const key=m.satin(m.stone.clone().lerp(m.mauve,.37),.85);
  const light=new MeshBasicMaterial({color:m.rose.clone().lerp(m.ivory,.38)});
  const trim = modelGroup(desk);
  trim.box(wood,0,.875,0,2.81,.116,.96,.052);
  trim.box(m.panel,0,.796,-.33,2.57,.085,.14,.026);
  for(const edge of [-1,1]) {
    trim.box(m.alloy,edge*1.19,.45,0,.12,.79,.70,.045);
    trim.box(m.rubber,edge*1.19,.105,0,.22,.08,.76,.028);
  }
  trim.box(m.rubber,-.26,.96,.08,1.67,.031,.46,.015);
  trim.box(m.metal,-.48,1.02,.16,.93,.051,.28,.025);
  trim.box(light,-.48,1.041,.16,.89,.012,.255,.009);
  for(let row=0;row<4;row++) for(let column=0;column<12;column++){
    trim.box(column===0 || row===3 && column>2 && column<8?m.grout:key,-.896+column*.073,1.062,.063+row*.064,.059,.022,.048,.005);
  }
  trim.box(m.rubber,-.25,.961,-.21,.54,.042,.28,.026);
  trim.box(m.metal,-.25,1.15,-.29,.10,.36,.11,.029);
  padded(desk,m.alloy,new Vector3(.25,1.012,.15),new Vector3(.137,.081,.219));
  trim.box(m.rubber,.975,1.328,-.10,.66,.79,.60,.052);
  trim.box(m.ceramic,.975,1.749,-.10,.675,.068,.615,.025);
  trim.box(m.smoke,.975,1.321,.207,.58,.62,.023,.009);
  trim.box(m.alloy,.975,1.36,.177,.52,.45,.029,.012);
  trim.box(m.edge,.975,1.275,.185,.49,.065,.021,.014);
  for(let i=0;i<8;i++) trim.box(m.strip,.975,1.727,.18-i*.071,.50,.014,.027,.004);
  trim.box(m.trace,.975,1.70,.219,.55,.013,.013,.004);
  const fans: Group[]=[];
  for(const fy of [1.206,1.487]) {
    const rotor=new Group();
    rotor.position.set(1.063,fy,.198);
    desk.add(rotor);
    const ring=new Mesh(new TorusGeometry(.105,.009,6,21),light);
    ring.position.copy(rotor.position);
    desk.add(ring);
    const blades=modelGroup(rotor);
    for(let i=0;i<6;i++) {
      const angle=i*Math.PI/3;
      const fin=new SphereGeometry(1,8,5).scale(.020,.052,.010).rotateZ(angle-.40);
      blades.piece(fin,m.metal,-Math.sin(angle)*.055,Math.cos(angle)*.055,0);
    }
    blades.build();
    fans.push(rotor);
  }
  cable(desk,m.rubber,[new Vector3(-.25,1.21,-.37),new Vector3(.07,.99,-.43),new Vector3(.58,.99,-.43),new Vector3(.77,1.20,-.39)],.013);
  const arc = new Mesh(new TorusGeometry(.145,.022,8,23,Math.PI),m.alloy);
  arc.position.set(-1.09,1.152,-.135);
  desk.add(arc);
  for(const side of [-1,1]) trim.box(chair,-1.09+side*.135,1.113,-.135,.075,.135,.082,.033);

  const chairZ=.79;
  trim.cylinder(m.metal,-.16,.33,chairZ,.057,.49,12);
  for(let i=0;i<5;i++){
    const angle=i*2*Math.PI/5;
    const leg=new CylinderGeometry(.027,.039,.28,9).rotateZ(Math.PI/2).rotateY(angle);
    trim.piece(leg,m.alloy,-.16+Math.cos(angle)*.154,.165,chairZ-Math.sin(angle)*.154);
    trim.cylinder(m.rubber,-.16+Math.cos(angle)*.30,.115,chairZ-Math.sin(angle)*.30,.058,.075,10);
  }
  trim.box(m.rubber,-.16,.77,chairZ+.22,.50,.56,.11,.048);
  padded(desk,chair,new Vector3(-.16,.557,chairZ),new Vector3(.67,.16,.60));
  padded(desk,chair,new Vector3(-.16,.82,chairZ+.21),new Vector3(.55,.58,.16)).rotation.x=.09;
  for(const side of [-1,1]){
    trim.box(m.rubber,-.16+side*.32,.623,chairZ,.042,.20,.045,.015);
    trim.box(m.alloy,-.16+side*.32,.734,chairZ,.068,.048,.32,.023);
  }
  trim.build();
  placeShadow(desk,shadow,new Vector3(0,.057,.23),3.15,1.95);
  const screen=studioScreen(desk,m,new Vector3(-.25,1.50,-.265),1.47,.83);
  return (time:number,active:boolean,lean:number)=>{
    for(const [index,fan] of fans.entries()) fan.rotation.z=time*(1.9+index*.29);
    light.color.copy(m.rose).lerp(m.ivory,active ? .70 + lean*.12 : .43+.055*Math.sin(time*1.9));
    screen(time,1,active);
  };
}
