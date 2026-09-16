const { Document, NodeIO } = require('@gltf-transform/core');
const { dedup, prune } = require('@gltf-transform/functions');

async function extractWeapon() {
    const io = new NodeIO();
    const doc = await io.read('public/assets/robotics/velociraptor/model/velociraptor.glb');
    const root = doc.getRoot();
    
    const weaponNodes = [];
    for (const node of root.listNodes()) {
        const mesh = node.getMesh();
        if (mesh) {
            const name = mesh.getName();
            if (name === 'mesh_Component874-Mesh' || name === 'mesh_645') {
                weaponNodes.push(node);
            }
        }
    }
    
    // Dispose all other meshes
    for (const node of root.listNodes()) {
        if (!weaponNodes.includes(node)) {
            node.dispose();
        }
    }
    
    await doc.transform(prune(), dedup());
    
    await io.write('public/assets/robotics/velociraptor/parts/weapon.glb', doc);
    console.log("Extracted weapon.glb");
}

extractWeapon().catch(console.error);
