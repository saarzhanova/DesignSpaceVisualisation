import { attributeSpace, THREE, tempV } from './frames2D.js';
import { view, geometryLayer } from './myMap.js';

console.log('frames in visual links:', attributeSpace);

let svg = document.getElementById('lines');

svg.appendChild(path);

const container = document.getElementById('container');
// const slider = document.getElementById('slider1');

let pathes = document.getElementById('lines');

function updatePath() {
    for (const frame of attributeSpace) {
        let buildingCoordinates = new THREE.Vector3(frame.coordinates.x, frame.coordinates.y, frame.coordinates.z);
        let buildingPoint = worldToScreen(buildingCoordinates, view);
        let framePoint = getFrameContainer(frame.frame, container);

        console.log(frame.id, buildingPoint, framePoint);

        if (!buildingPoint || !framePoint) {
            frame.line.style.display = 'none';
            continue;
        }

        frame.line.style.display = '';

        const lift = 0;     // немного подняться над зданием
        const offsetX = 0;  // отступ перед слайдером
        const r = 0;        // скругление

        const yTop = Math.min(buildingPoint.y, framePoint.y) - lift;
        const xMid = framePoint.x - offsetX;

        const d = `
        M ${buildingPoint.x} ${buildingPoint.y}
        L ${buildingPoint.x} ${yTop + r}
        Q ${buildingPoint.x} ${yTop} ${buildingPoint.x + r} ${yTop}
        L ${xMid - r} ${yTop}
        Q ${xMid} ${yTop} ${xMid} ${yTop + r}
        L ${xMid} ${framePoint.y - r}
        Q ${xMid} ${framePoint.y} ${xMid + r} ${framePoint.y}
        L ${framePoint.x} ${framePoint.y}
    `;

        path.setAttribute('d', d);

        pathes.appendChild(frame.line);
    }
}

function getFrameContainer(frameEl, containerEl) {
    const fRect = frameEl.getBoundingClientRect();
    const cRect = containerEl.getBoundingClientRect();

    return {
        x: fRect.left + fRect.width / 2 - cRect.left,
        y: fRect.bottom - cRect.top,
    };
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
