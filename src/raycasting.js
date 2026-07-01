const raycaster = new itowns.THREE.Raycaster();
const mouse = new itowns.THREE.Vector2();

function getCamera3D(view) {
    if (view.camera && view.camera.camera3D) return view.camera.camera3D;
    const cam = view.getCamera?.();
    if (cam && cam.camera3D) return cam.camera3D;
    return null;
}

view.domElement.addEventListener('click', (event) => {
    const root = geometryLayer.object3d;
    if (!root) return;

    const rect = view.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);

    const camera3D = getCamera3D(view);
    if (!camera3D) return;

    raycaster.setFromCamera(mouse, camera3D);

    const hits = raycaster.intersectObject(root, true);
    if (!hits.length) return;


    console.log('тык по зданию 💖');
    console.log('hit point:', hits[0].point);
    // console.log(hits[0].object.uuid)
});





