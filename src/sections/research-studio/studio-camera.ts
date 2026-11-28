import { Vector3, type Box3 } from "three";

export type PanelSide = "left" | "right";
const up = new Vector3(0,1,0);

export function desktopStudioFit(bounds: Box3, eye: Vector3, width: number, height: number, side: PanelSide | null, panelWidth: number) {
  const axis = new Vector3().crossVectors(up,eye).normalize();
  const vertical = new Vector3().crossVectors(eye,axis).normalize();
  const size = bounds.getSize(new Vector3());
  const projectedWidth = Math.abs(axis.x)*size.x + Math.abs(axis.y)*size.y + Math.abs(axis.z)*size.z;
  const projectedHeight = Math.abs(vertical.x)*size.x + Math.abs(vertical.y)*size.y + Math.abs(vertical.z)*size.z;
  const margin = Math.max(22,width*.06);
  const gutter = side ? Math.max(0,panelWidth+24) : 0;
  const available = Math.max(width*.40,width-margin*2-gutter);
  return {
    span: Math.max(projectedHeight/.60, projectedWidth*1.16*height/available),
    offset: side ? (side === "left" ? 1 : -1)*gutter/(2*width) : 0,
  };
}
