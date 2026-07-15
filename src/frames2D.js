import { view } from './myMap.js';
import {findActor} from "./interaction.js";

const THREE = itowns.THREE;

const labelsRoot = document.getElementById('labels');

let activeFrame = null;
const frontZ = 999999;
const hoverZ = 999998;

let frames = [];

let hoverColor = '#f995b2';
let normalFrameBack = '#f8c9dd'

export function setAttributeSpace(attributeSpace, year) {
    console.log(year, attributeSpace);
    clearFrames();

    for (let building of attributeSpace) {
        let frameEl;
        for (let actor of building.actors) {
            let startYear = actor.ownership_start_year;
            let endYear = actor.ownership_end_year;
            if (!year || isBetween(year, startYear, endYear)) {
                frameEl = fillFrameText(building.id, actor, year, attributeSpace);
            }
        }

        if (!frameEl) continue;

        building.frame = frameEl;
        addFrameEvents(building);
        frames.push(building);
    }

    updateFrames();

    console.log('frames:', frames);
}

function isBetween(n, start, end) {
    return (n >= start && n < end)
}

function clearFrames() {
    for (const frame of frames) {
        if (frame.frame) frame.frame.remove();
        if (frame.line) frame.line.remove();
    }
    frames.length = 0;
}

function fillFrameText(id, actors, year, attributeSpace) {
    let el = createFrame();
    addActorsToClass(attributeSpace, id, el)

    let title = document.createElement('div');
    title.textContent = 'Building ' + id;
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '6px';

    el.appendChild(title);

    // for (let actor of actors) {
        if (actors.owner.length) {
            let ownerLabel = document.createElement('div');
            ownerLabel.style.fontSize = '11px';

            let prefix = document.createElement('span');
            prefix.textContent = 'Owner: ';
            ownerLabel.appendChild(prefix);

            let ownerSpan = document.createElement('span');
            ownerSpan.id = actors.owner;
            console.log(el)
            ownerSpan.textContent = actors.owner;
            ownerSpan.style.cursor = 'pointer';
            ownerSpan.style.transition = 'color 0.2s ease';

            ownerSpan.addEventListener('mouseenter', () => {
                ownerSpan.style.color = '#ec1763';
            });

            ownerSpan.addEventListener('mouseleave', () => {
                    ownerSpan.style.color = 'black';
            });

            ownerSpan.addEventListener('click', () => {
                console.log('clicked ' + actors.owner);
                findActor(actors.owner, ownerSpan, attributeSpace);
            });

            ownerLabel.appendChild(ownerSpan);
            el.appendChild(ownerLabel);
        }

    let visibleTenants = actors.tenants.filter((tenant) => {
        let startYear = tenant.renting_start_year;
        let endYear = tenant.renting_end_year;

        return !year || isBetween(year, startYear, endYear);
    });

    if (visibleTenants.length) {
        let tenantLabel = document.createElement('div');
        tenantLabel.style.fontSize = '11px';

        let prefix = document.createElement('span');
        prefix.textContent = 'Tenants: ';
        tenantLabel.appendChild(prefix);

        visibleTenants.forEach((tenant, index) => {
                let tenantSpan = document.createElement('span');
                tenantSpan.textContent = tenant.id;
                tenantSpan.style.transition = 'color 0.2s ease';

                tenantSpan.addEventListener('mouseenter', () => {
                    tenantSpan.style.color = '#ec1763';
                });

                tenantSpan.addEventListener('mouseleave', () => {
                        tenantSpan.style.color = 'black';
                });

                tenantSpan.addEventListener('click', () => {
                    console.log('clicked ' + tenant);
                    findActor(tenant.id, tenantSpan, attributeSpace);
                });

                tenantLabel.appendChild(tenantSpan);

                if (index < visibleTenants.length - 1) {
                    tenantLabel.appendChild(document.createTextNode(', '));
                }
        });

        el.appendChild(tenantLabel);
    }
    // }

    labelsRoot.appendChild(el);

    return el;
}

function addActorsToClass(attributeSpace, id, el) {
    attributeSpace.forEach(building => {
        if (building.id === id) {
            building.actors.forEach(actors => {
                el.classList.add(actors.owner)
                actors.tenants.forEach(tenant => {
                    el.classList.add(tenant.id)
                })
            })
        }
    })
}

function fillFrameGraph() {

}

function createFrame() {
    let el = document.createElement('div');
    el.style.pointerEvents = 'auto'; //important
    el.classList.add('frame');
    return el;
}

function addFrameEvents(item) {
    item.isPinned = false;
    item.startZIndex = 0;

    item.frame.addEventListener('mouseenter', () => {
        if (!item.isPinned) {
            item.frame.style.background = hoverColor;
            item.frame.style.zIndex = hoverZ;
        }
    });

    item.frame.addEventListener('mouseleave', () => {
        if (!item.isPinned) {
            item.frame.style.background = normalFrameBack;
            item.frame.style.zIndex = item.startZIndex;
        }
    });

    item.frame.addEventListener('click', () => {
        item.isPinned = !item.isPinned;

        if (item.isPinned) {
            activeFrame = item;
            item.frame.style.background = hoverColor;
            item.frame.style.zIndex = frontZ;
        } else {
            activeFrame = null;
            item.frame.style.background = normalFrameBack;
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


