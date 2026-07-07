import { frames, THREE, tempV } from './frames2D.js';
import { view, geometryLayer } from './myMap.js';

console.log('frames in visual links:', frames);

const container = document.getElementById('container');

let lines = document.getElementById('lines');

export function updatePath() {
    for (const frame of frames) {
        let buildingCoordinates = new THREE.Vector3(frame.coordinates.x, frame.coordinates.y, frame.coordinates.z);
        let buildingPoint = worldToScreen(buildingCoordinates, view);
        let framePoint = getFrameContainer(frame.frame, container);

        if (!buildingPoint || !framePoint) {
            frame.line.style.display = 'none';
            continue;
        }

        frame.line.style.display = '';

        // frame.line.setAttribute('x1', buildingPoint.x);
        // frame.line.setAttribute('y1', buildingPoint.y);
        // frame.line.setAttribute('x2', framePoint.x);
        // frame.line.setAttribute('y2', framePoint.y);

        const cornerY = framePoint.y;

        const d = `
            M ${buildingPoint.x} ${buildingPoint.y}
            L ${buildingPoint.x} ${cornerY}
            L ${framePoint.x} ${framePoint.y -10}
        `;

        frame.line.setAttribute('d', d);

        lines.appendChild(frame.line);
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
