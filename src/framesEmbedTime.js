import { view } from './myMap.js';
import {findActor} from "./interaction.js";
// import { highlightTimelineOwners, clearTimelineOwnerHighlight } from './timeline.js';
import { attachTimeline } from './embeddedTimeline.js';


const THREE = itowns.THREE;
const tempV = new THREE.Vector3();

const labelsRoot = document.getElementById('labels');

export let activeBuilding = null;
let pinnedBuilding = null;
const frontZ = 999999;
const hoverZ = 999998;

let frames = [];

let hoverColor = '#f995b2';
let normalFrameBack = '#f8c9dd'

export function setAttributeSpace(attributeSpace, year) {
    console.log(year, attributeSpace);
    clearFrames();

    for (let building of attributeSpace) {
        let frameEl = fillFrameText(building, 1935, attributeSpace);

        if (!frameEl) continue;

        building.frame = frameEl;
        attachTimeline(building);
        addFrameEvents(building);
        frames.push(building);
    }

    updateFramesPosition();

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

export function updateFrameByYear(building, year, attributeSpace) {
    let buildingId = building.id;
    let newBuilding;
    let frame = building.frame;
    let previousOwner = frame.getElementsByClassName('owner')[0].textContent
    let tenantsLabel = frame.getElementsByClassName('tenants')[0]

    let newOwner = null;
    console.log(building)
    let tenantsList;
    building.actors.forEach(actors => {
        let startYearOwner = actors.ownership_start_year;
        let endYearOwner = actors.ownership_end_year;
        if (isBetween(year, startYearOwner, endYearOwner)) {
            newOwner = actors.owner;
        }
        tenantsList = [];
        actors.tenants.forEach(tenant => {
            let startYearTenants = tenant.renting_start_year;
            let endYearTenants = tenant.renting_end_year;
            if (isBetween(year, startYearTenants, endYearTenants)) {
                console.log(tenant.id)
                tenantsList.push(tenant);
            }
        })
    });

    if (newOwner) {
        frame.getElementsByClassName('owner')[0].textContent = newOwner;
    } else {
        frame.getElementsByClassName('owner')[0].textContent = '-';
    }



    if (newOwner && tenantsLabel && tenantsList.length) {
        frame.getElementsByClassName('tenants')[0].style.display = 'block';
        frame.getElementsByClassName('tenants-names')[0].replaceChildren();
        tenantsList.forEach((tenant, index) => {
            let tenantSpan = document.createElement('span');
            tenantSpan.classList.add('tenants');
            tenantSpan.id = tenant.id;
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

            frame.getElementsByClassName('tenants-names')[0].appendChild(tenantSpan);

            if (index < tenantsList.length - 1) {
                frame.getElementsByClassName('tenants-names')[0].appendChild(document.createTextNode(', '));
            }
        });
    } else if (tenantsLabel) {
        frame.getElementsByClassName('tenants')[0].style.display = 'none';
    } else if (tenantsLabel && !tenantsList) {
        frame.getElementsByClassName('tenants')[0].style.display = 'none';
    }
}

function fillFrameText(building, year, attributeSpace) {
    let id = building.id;
    let actors = building.actors[0]
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
        ownerSpan.classList.add('owner');
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
        tenantLabel.classList.add('tenants');
        tenantLabel.style.fontSize = '11px';

        let prefix = document.createElement('span');
        prefix.textContent = 'Tenants: ';
        tenantLabel.appendChild(prefix);

        let tenantsContainer = document.createElement('span');
        tenantsContainer.className = 'tenants-names';


        visibleTenants.forEach((tenant, index) => {
            let tenantSpan = document.createElement('span');
            tenantSpan.classList.add('tenants');
            tenantSpan.id = tenant.id;
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

            tenantsContainer.appendChild(tenantSpan);

            if (index < visibleTenants.length - 1) {
                tenantsContainer.appendChild(document.createTextNode(', '));
            }
        });
        tenantLabel.appendChild(tenantsContainer);

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

function createFrame() {
    let el = document.createElement('div');
    el.style.pointerEvents = 'auto'; //important
    el.classList.add('frame');
    return el;
}

function addFrameEvents(building) {
    building.isFramePinned = false;
    building.startZIndex = 0;

    const timeline = building.frame.querySelector('.frame-year-slider');
    const timelineColourSelected = '#D76B00'
    const timelineColourNormal = '#F37827'

    building.frame.addEventListener('mouseenter', () => {
        updateCurrentBuilding(building);
        if (!building.isFramePinned) {
            building.frame.style.background = hoverColor;
            building.frame.style.zIndex = hoverZ;
            timeline.style.setProperty('--slider-color', timelineColourSelected);
        }
        console.log('frame hovered', building);
    });

    building.frame.addEventListener('mouseleave', () => {
        if (!building.isFramePinned) {
            building.frame.style.background = normalFrameBack;
            building.frame.style.zIndex = building.startZIndex;

            timeline.style.setProperty('--slider-color', timelineColourNormal);
        }
    });

    building.frame.addEventListener('click', () => {
        console.log('frame pinned', building);
        if (building.isFramePinned) {
            building.isFramePinned = false;
            pinnedBuilding = null;

            building.frame.style.background = normalFrameBack;
            building.frame.style.zIndex = building.startZIndex;
            timeline.style.setProperty('--slider-color', timelineColourNormal);

            return;
        }

        // открепляем предыдущий активный фрейм
        if (pinnedBuilding && pinnedBuilding !== building) {
            pinnedBuilding.isPinned = false;
            pinnedBuilding.frame.style.background = normalFrameBack;
            pinnedBuilding.frame.style.zIndex = pinnedBuilding.startZIndex;
            timeline.style.setProperty('--slider-color', timelineColourNormal);

        }

        // закрепляем новый
        building.isFramePinned = true;
        pinnedBuilding = building;

        building.frame.style.background = hoverColor;
        building.frame.style.zIndex = frontZ;
        timeline.style.setProperty('--slider-color', timelineColourSelected);

    });
}

function updateCurrentBuilding(building) {
    activeBuilding = building;
}

function updateFramesPosition() {
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

        if (frames[i].isFramePinned) {
            frames[i].frame.style.zIndex = frontZ;
        } else {
            frames[i].frame.style.zIndex = baseZ;
        }
    }
}

view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.AFTER_RENDER, updateFramesPosition);

export { frames, THREE, tempV };


