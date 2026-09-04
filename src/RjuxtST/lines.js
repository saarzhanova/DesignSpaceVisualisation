import { view } from '../myMap.js';
import { visualLinks } from './frameJuxt.js';

const THREE = itowns.THREE;
const tempV = new THREE.Vector3();

const svg = document.getElementById('lines');
const container = document.getElementById('container');

let paths = [];

export function rebuildVisualLinks() {
    svg.innerHTML = '';
    paths = [];

    visualLinks.forEach(link => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('visual-link');

        svg.appendChild(path);

        paths.push({
            ...link,
            path: path
        });
    });
}

export function updatePath() {
    for (const link of paths) {
        const buildingPoint = worldToContainer(link.building.coordinates);
        const tenantPoint = getElementPoint(link.element);

        if (!buildingPoint || !tenantPoint) {
            link.path.style.display = 'none';
            continue;
        }

        link.path.style.display = '';

        const x1 = tenantPoint.x;
        const y1 = tenantPoint.y;

        const x2 = buildingPoint.x;
        const y2 = buildingPoint.y;

        const xMid = x1 + 80;

        const d = `
            M ${x1} ${y1}
            C ${xMid} ${y1}, ${xMid} ${y2}, ${x2} ${y2}
        `;

        link.path.setAttribute('d', d);
    }
}

function getElementPoint(el) {
    const elRect = el.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return {
        x: elRect.right - containerRect.left,
        y: elRect.top + elRect.height / 2 - containerRect.top
    };
}

function worldToContainer(world) {
    const viewRect = view.domElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    tempV.copy(world).project(view.camera.camera3D);

    if (tempV.z < -1 || tempV.z > 1) return null;

    return {
        x: viewRect.left + (tempV.x * 0.5 + 0.5) * viewRect.width - containerRect.left,
        y: viewRect.top + (tempV.y * -0.5 + 0.5) * viewRect.height - containerRect.top
    };
}

view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.AFTER_RENDER, updatePath);