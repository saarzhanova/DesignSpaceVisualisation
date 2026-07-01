const svg = document.getElementById('lines');
const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
line.setAttribute('stroke', 'red');
line.setAttribute('stroke-width', '2');
svg.appendChild(line);

const labelEl = frame;
const buildingWorld = new THREE.Vector3(
    4200935.663427308,
    172386.3153304664,
    4780092.978880648
);
const container = document.getElementById('container');
const slider = document.getElementById('slider1');

function updateLine() {

    const containerRect = container.getBoundingClientRect();

    // const labelRect = labelEl.getBoundingClientRect();
    //
    // const x1 = (labelRect.left - containerRect.left) + labelRect.width / 2;
    // const y1 = (labelRect.top  - containerRect.top)  + labelRect.height / 2;

    const p1 = getSliderPointInContainer(slider, container, 30);

    line.setAttribute('x1', p1.x);
    line.setAttribute('y1', p1.y);

    const p2 = worldToScreen(buildingWorld, view);
    if (!p2) {
        line.style.display = 'none';
        return;
    }
    line.style.display = '';

    // line.setAttribute('x1', x1);
    // line.setAttribute('y1', y1);
    line.setAttribute('x2', p2.x);
    line.setAttribute('y2', p2.y);
}

function getSliderPointInContainer(sliderEl, containerEl, targetValue) {
    const sRect = sliderEl.getBoundingClientRect();
    const cRect = containerEl.getBoundingClientRect();

    const min = Number(sliderEl.min || 0);
    const max = Number(sliderEl.max || 100);

    const t = (targetValue - min) / (max - min); // 0..1

    // приблизительно: бегунок по центру трека
    const xViewport = sRect.left + t * sRect.width;
    const yViewport = sRect.top + sRect.height / 2;

    return {
        x: xViewport - cRect.left,
        y: yViewport - cRect.top,
    };
}

function worldToScreen(world, view) {
    const rect = view.domElement.getBoundingClientRect();
    const cam = view.camera.camera3D;

    tempV.copy(world).project(cam);

    if (tempV.z < -1 || tempV.z > 1) return null;

    return {
        x: (tempV.x * 0.5 + 0.5) * rect.width,
        y: (tempV.y * -0.5 + 0.5) * rect.height,
        z: tempV.z,
    };
}


view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.AFTER_RENDER, updateLine);
