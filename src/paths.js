const svg = document.getElementById('lines');

const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
path.setAttribute('stroke', '#ec1763');
path.setAttribute('stroke-width', '1');
path.setAttribute('fill', 'none');
svg.appendChild(path);

// colors:
// light blue #ceeaee
// green #cdd629
// blue #5568af
// orange #f37826
// pink #ec1763
// light pink #f8c9dd

const labelEl = frame;
const buildingWorld = new THREE.Vector3(
    4200935.663427308,
    172386.3153304664,
    4780092.978880648
);

const container = document.getElementById('container');
const slider = document.getElementById('slider1');

function updatePath() {
    const buildingPoint = worldToScreen(buildingWorld, view);
    const sliderPoint = getSliderPointInContainer(slider, container, 30);

    if (!buildingPoint || !sliderPoint) {
        path.style.display = 'none';
        return;
    }

    path.style.display = '';

    const lift = 30;     // немного подняться над зданием
    const offsetX = 40;  // отступ перед слайдером
    const r = 14;        // скругление

    const yTop = Math.min(buildingPoint.y, sliderPoint.y) - lift;
    const xMid = sliderPoint.x - offsetX;

    const d = `
        M ${buildingPoint.x} ${buildingPoint.y}
        L ${buildingPoint.x} ${yTop + r}
        Q ${buildingPoint.x} ${yTop} ${buildingPoint.x + r} ${yTop}
        L ${xMid - r} ${yTop}
        Q ${xMid} ${yTop} ${xMid} ${yTop + r}
        L ${xMid} ${sliderPoint.y - r}
        Q ${xMid} ${sliderPoint.y} ${xMid + r} ${sliderPoint.y}
        L ${sliderPoint.x} ${sliderPoint.y}
    `;

    path.setAttribute('d', d);
}

function getSliderPointInContainer(sliderEl, containerEl, targetValue) {
    const sRect = sliderEl.getBoundingClientRect();
    const cRect = containerEl.getBoundingClientRect();

    const min = Number(sliderEl.min || 0);
    const max = Number(sliderEl.max || 100);

    const t = (targetValue - min) / (max - min); // 0..1

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

view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.AFTER_RENDER, updatePath);
