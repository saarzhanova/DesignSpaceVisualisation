import { view } from './myMap.js';

const THREE = itowns.THREE;

const labelsRoot = document.getElementById('labels');

let activeFrame = null;
const frontZ = 999999;
const hoverZ = 999998;

let frames = [];

export function setAttributeSpace(attributeSpace) {
    clearFrames();

    for (let building of attributeSpace) {
        const frameEl = fillFrame(building.id, building.owners);

        if (!frameEl) continue;

        building.frame = frameEl;
        addFrameEvents(building);
        frames.push(building);
    }

    updateFrames();

    console.log('frames:', frames);
}

function clearFrames() {
    for (const frame of frames) {
        if (frame.frame) frame.frame.remove();
        if (frame.line) frame.line.remove();
    }
    frames.length = 0;
}

function fillFrame(id, actors) {
    let el = createFrame();

    let top = 40

    for (let i in actors) {
        let text = document.createElement('div');
        text.textContent = 'Building ' + id + ':';
        text.style.position = 'absolute';
        text.style.top = '10px';
        text.style.left = '20px';
        text.style.marginTop = '6px';

        let actorID = document.createElement('div');
        actorID.textContent = actors[i];
        actorID.style.position = 'absolute';
        actorID.style.top = top + 'px';
        actorID.style.left = '20px';
        actorID.style.marginTop = '6px';

        el.appendChild(text)
        el.appendChild(actorID)
        top += 20;
    }
    labelsRoot.appendChild(el);

    if (el.childNodes.length) {
        return el;
    }
}

function createFrame() {
    let el = document.createElement('div');
    el.style.pointerEvents = 'auto'; //important
    el.style.background = 'white';
    el.style.padding = '8px';
    el.style.borderRadius = '8px';
    el.style.color = 'black';
    el.style.width = '150px';
    return el;
}

function addFrameEvents(item) {
    item.isPinned = false;
    item.startZIndex = 0;

    item.frame.addEventListener('mouseenter', () => {
        if (!item.isPinned) {
            item.frame.style.border = "2px solid #ec1763";
            item.frame.style.zIndex = hoverZ;
        }
    });

    item.frame.addEventListener('mouseleave', () => {
        if (!item.isPinned) {
            item.frame.style.border = "none";
            item.frame.style.zIndex = item.startZIndex;
        }
    });

    item.frame.addEventListener('click', () => {
        console.log('clicked FRAME');

        item.isPinned = !item.isPinned;

        if (item.isPinned) {
            activeFrame = item;
            item.frame.style.border = "2px solid #ec1763";
            item.frame.style.zIndex = frontZ;
        } else {
            activeFrame = null;
            item.frame.style.border = "none";
            item.frame.style.zIndex = item.startZIndex;
        }
    });
}

const tempV = new THREE.Vector3();

function updateFrames() {
    const rect = view.domElement.getBoundingClientRect();
    const camera3D = view.camera.camera3D;

    for (let i = 0; i < frames.length; i++) {
        // getting NDC
        tempV.copy(frames[i].coordinates);
        tempV.y = tempV.y - 50
        tempV.z = tempV.z + 20
        tempV.project(camera3D);

        if (tempV.z < -1 || tempV.z > 1) {
            frames[i].frame.style.display = 'none';
            continue;
        }
        frames[i].frame.style.display = '';

        // formula for turning NDC to pixels on the screen
        const x = (tempV.x * 0.5 + 0.5) * rect.width;
        const y = (tempV.y * -0.5 + 0.5) * rect.height;

        frames[i].frame.style.left = `${x}px`;
        frames[i].frame.style.top  = `${y}px`;

        // layering
        // frames[i].frame.style.zIndex = ((-tempV.z * 0.5 + 0.5) * 100000) | 0;
        const baseZ = ((-tempV.z * 0.5 + 0.5) * 100000) | 0;
        frames[i].startZIndex = baseZ;

        if (frames[i].isPinned) {
            frames[i].frame.style.zIndex = frontZ;
        } else {
            frames[i].frame.style.zIndex = baseZ;
        }
    }
}

view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.AFTER_RENDER, updateFrames);

export { frames, THREE, tempV };


