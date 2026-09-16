export const velociraptorAssets = {
  model: {
    velociraptor: '/assets/robotics/velociraptor/model/velociraptor.glb',
  },
  parts: {
    weapon: '/assets/robotics/velociraptor/parts/weapon.glb',
  },
  renders: {
    hero34: '/assets/robotics/velociraptor/renders/velociraptor-hero-34.webp',
    heroOpposite: '/assets/robotics/velociraptor/renders/velociraptor-hero-opposite.webp',
    top: '/assets/robotics/velociraptor/renders/velociraptor-top.webp',
    front: '/assets/robotics/velociraptor/renders/velociraptor-front.webp',
    side: '/assets/robotics/velociraptor/renders/velociraptor-side.webp',
    lowWeapon: '/assets/robotics/velociraptor/renders/velociraptor-low-weapon.webp',
    wireframe: '/assets/robotics/velociraptor/renders/velociraptor-wireframe.webp',
    wireframeTop: '/assets/robotics/velociraptor/renders/velociraptor-wireframe-top.webp',
    silhouette: '/assets/robotics/velociraptor/renders/velociraptor-silhouette.webp',
  },
  fea: {
    sideStress: '/assets/robotics/velociraptor/fea/fea-side-stress.png',
    sideDisplacement: '/assets/robotics/velociraptor/fea/fea-side-displacement.png',
    sideSafety: '/assets/robotics/velociraptor/fea/fea-side-safety.png',
    upwardStress: '/assets/robotics/velociraptor/fea/fea-upward-stress.png',
    upwardDisplacement: '/assets/robotics/velociraptor/fea/fea-upward-displacement.png',
    upwardSafety: '/assets/robotics/velociraptor/fea/fea-upward-safety.png',
    weaponProperties: '/assets/robotics/velociraptor/fea/weapon-properties.png',
  },
  animation: {
    impactOrigin: [32.43, -135.89, 37] as [number, number, number], // Visual contact origin derived from CAD weapon perimeter; not an empirical impact measurement.
    weaponPivot: [0, -135.89, 37] as [number, number, number],
    weaponAxis: [0, 0, 1] as [number, number, number],
  }
};
