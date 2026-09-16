const fs = require('fs');
const { NodeIO } = require('@gltf-transform/core');

async function inspectWeapon() {
    const io = new NodeIO();
    const doc = await io.read('public/assets/robotics/velociraptor/parts/weapon.glb');
    const root = doc.getRoot();
    
    // We need to calculate the bounding box to find the center/pivot
    // Since gltf-transform doesn't have a built-in bounds calculator, we can read the accessor min/max
    let min = [Infinity, Infinity, Infinity];
    let max = [-Infinity, -Infinity, -Infinity];
    
    for (const mesh of root.listMeshes()) {
        for (const prim of mesh.listPrimitives()) {
            const position = prim.getAttribute('POSITION');
            if (position) {
                const pMin = position.getMin([]);
                const pMax = position.getMax([]);
                min = [Math.min(min[0], pMin[0]), Math.min(min[1], pMin[1]), Math.min(min[2], pMin[2])];
                max = [Math.max(max[0], pMax[0]), Math.max(max[1], pMax[1]), Math.max(max[2], pMax[2])];
            }
        }
    }
    
    const center = [
        (min[0] + max[0]) / 2,
        (min[1] + max[1]) / 2,
        (min[2] + max[2]) / 2
    ];
    
    const size = [
        max[0] - min[0],
        max[1] - min[1],
        max[2] - min[2]
    ];
    
    const radius = Math.max(size[0], size[1], size[2]) / 2;
    
    // The weapon is a horizontal spinner. Usually spins around Y or Z axis depending on CAD orientation.
    // We will assume the axis is the one with the smallest dimension (thickness).
    let axis = [0, 1, 0];
    if (size[0] < size[1] && size[0] < size[2]) axis = [1, 0, 0];
    if (size[2] < size[0] && size[2] < size[1]) axis = [0, 0, 1];
    
    // Impact origin is on the outer perimeter. We can choose the point furthest along X (or another axis).
    // If it spins around Y, the radius is in X/Z plane.
    let impactOrigin = [...center];
    if (axis[1] === 1) impactOrigin[0] += size[0]/2;
    else if (axis[2] === 1) impactOrigin[0] += size[0]/2;
    else impactOrigin[1] += size[1]/2;
    
    const result = {
        pivot: center,
        axis: axis,
        boundingRadius: radius,
        boundingBox: { min, max, size },
        impactOrigin
    };
    
    console.log(JSON.stringify(result, null, 2));
    
    // Write to technical/
    fs.writeFileSync('public/assets/robotics/velociraptor/technical/weapon-animation.json', JSON.stringify({
        pivot: center,
        axis: axis,
        boundingRadius: radius,
        boundingBox: { min, max, size }
    }, null, 2));
    
    fs.writeFileSync('public/assets/robotics/velociraptor/technical/impact-origin.json', JSON.stringify({
        impactOrigin,
        note: "Visual contact origin derived from CAD weapon perimeter; not an empirical impact measurement."
    }, null, 2));
}

inspectWeapon().catch(console.error);
