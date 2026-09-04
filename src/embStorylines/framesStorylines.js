import { view } from '../myMap.js';

const THREE = itowns.THREE;
const tempV = new THREE.Vector3();
const labelsRoot = document.getElementById('labels');

const fullStartYear = 1920;
const fullEndYear = 1960;
const visibleYears = 8;
let frames = [];
export let activeBuilding = null;
let pinnedBuilding = null;
const frontZ = 999999;
const hoverZ = 999998;
let hoverColor = '#f995b2';
let normalFrameBack = '#f8c9dd'

export function setAttributeSpace(attributeSpace, year) {
    console.log(year, attributeSpace);

    for (let building of attributeSpace) {
        let frameEl = fillFrameText(building, 1935, attributeSpace);
        if (!frameEl) continue;
        building.frame = frameEl;
        addFrameEvents(building);
        frames.push(building);
    }
    updateFramesPosition();
    console.log('frames:', frames);
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

    const timelineBlock = createTimelineBlock(building);
    el.appendChild(timelineBlock);

    labelsRoot.appendChild(el);

    return el;
}

function createTimelineBlock(building) {
    if (building.visibleStartYear === undefined) {
        building.visibleStartYear = 1930;
    }
    const timelineBlock = document.createElement('div');
    timelineBlock.className = 'building-timeline-block';

    const tenantsLayer = document.createElement('div');
    tenantsLayer.className = 'timeline-layer tenants-layer';

    const ownersLayer = document.createElement('div');
    ownersLayer.className = 'timeline-layer owners-layer';

    const mainLine = document.createElement('div');
    mainLine.className = 'main-building-timeline';

    const ticksLayer = document.createElement('div');
    ticksLayer.className = 'timeline-ticks-layer';

    timelineBlock.appendChild(ticksLayer);
    timelineBlock.appendChild(tenantsLayer);
    timelineBlock.appendChild(ownersLayer);
    timelineBlock.appendChild(mainLine);
    timelineBlock.dataset.visibleStartYear = building.visibleStartYear;

    drawTimelines(building, timelineBlock, tenantsLayer, ownersLayer);

    mergeNeighbourTenantTimelines(timelineBlock);
    fixOverlayingLabels(timelineBlock);
    addTimelineScrollEvents(timelineBlock, building);

    return timelineBlock;
}

function mergeNeighbourTenantTimelines(frame) {
    let timelines = [...frame.querySelectorAll('.tenant-contract-timeline')];

    let changed = true;

    while (changed) {
        changed = false;

        timelines = [...frame.querySelectorAll('.tenant-contract-timeline')];

        for (let i = 0; i < timelines.length; i++) {
            const current = timelines[i];

            const match = timelines.find(next => {
                if (next === current) return false;

                const sameTenant = current.dataset.actorId === next.dataset.actorId;
                const touching = Number(current.dataset.end) === Number(next.dataset.start);

                return sameTenant && touching;
            });

            if (!match) continue;

            const newEnd = Number(match.dataset.end);

            current.dataset.end = newEnd;

            const visibleStartYear = Number(current.closest('.building-timeline-block').dataset.visibleStartYear);

            const startPercent = yearToPercent(Number(current.dataset.start), visibleStartYear);
            const endPercent = yearToPercent(newEnd, visibleStartYear);

            current.style.left = `${startPercent}%`;
            current.style.width = `${endPercent - startPercent}%`;

            match.remove();

            changed = true;
            break;
        }
    }
}

function yearToPercent(year, visibleStartYear) {
    const visibleEndYear = visibleStartYear + visibleYears;
    return ((year - visibleStartYear) / (visibleEndYear - visibleStartYear)) * 100;
}

function fixOverlayingLabels(timelineBlock) {
    requestAnimationFrame(() => {
        const timelines = [...timelineBlock.querySelectorAll('.tenant-contract-timeline, .owner-contract-timeline')];

        timelines.forEach(timeline => {
            const label = timeline.querySelector('.timeline-label');
            if (!label) return;

            label.classList.remove('label-left', 'label-right', 'label-up');
            label.style.top = '';
            label.style.left = '';
        });

        timelines.forEach(timeline => {
            const label = timeline.querySelector('.timeline-label');
            if (!label) return;

            const timelineWidth = timeline.offsetWidth;
            const labelWidth = label.scrollWidth;
            const start = Number(timeline.dataset.start);
            const end = Number(timeline.dataset.end);

            if (labelWidth <= timelineWidth) {
                label.classList.add('label-center');
                return;
            }

            const hasLeftNeighbour = timelines.some(other => {
                if (other === timeline) return false;
                return Number(other.dataset.end) === start;
            });

            const hasRightNeighbour = timelines.some(other => {
                if (other === timeline) return false;
                return Number(other.dataset.start) === end;
            });

            if (!hasRightNeighbour) {
                label.classList.add('label-right');
            } else if (!hasLeftNeighbour) {
                label.classList.add('label-left');
            } else {
                label.classList.add('label-up');

                const upLevel = getFreeLabelLevel(timeline, timelines);
                label.style.top = `${-14 - upLevel * 14}px`;

                const layer = timeline.closest('.timeline-layer');
                if (layer) {
                    const currentHeight = layer.offsetHeight;
                    const neededHeight = currentHeight + upLevel * 14;
                    layer.style.height = `${neededHeight}px`;
                }
            }
        });
    });
}

function addTimelineScrollEvents(timelinesBlock, building) {
    let isDragging = false;
    let startX = 0;
    let startVisibleYear = 0;

    timelinesBlock.addEventListener('wheel', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
            ? event.deltaX
            : event.deltaY;

        building.visibleStartYear += delta * 0.03; //scrolling speed
        clampVisibleYear(building);

        redrawBuildingTimelineContent(building);
    }, { passive: false });

    timelinesBlock.addEventListener('pointerdown', (event) => {
        event.stopPropagation();

        isDragging = true;
        startX = event.clientX;
        startVisibleYear = building.visibleStartYear;

        timelinesBlock.setPointerCapture(event.pointerId);
        timelinesBlock.style.cursor = 'grabbing';
    });

    timelinesBlock.addEventListener('pointermove', (event) => {
        if (!isDragging) return;
        event.stopPropagation();

        const dx = event.clientX - startX;
        building.visibleStartYear = startVisibleYear - dx * 0.2; // dragging speed

        clampVisibleYear(building);
        redrawBuildingTimelineContent(building);
    });

    timelinesBlock.addEventListener('pointerup', (event) => {
        isDragging = false;
        timelinesBlock.releasePointerCapture(event.pointerId);
        timelinesBlock.style.cursor = 'grab';
    });

    timelinesBlock.addEventListener('pointercancel', () => {
        isDragging = false;
        timelinesBlock.style.cursor = 'grab';
    });

    timelinesBlock.style.cursor = 'grab';
}

function clampVisibleYear(building) {
    const min = fullStartYear;
    const max = fullEndYear - visibleYears;

    building.visibleStartYear = Math.max(min, Math.min(max, building.visibleStartYear));
}

function redrawBuildingTimelineContent(building) {
    const block = building.frame.querySelector('.building-timeline-block');
    if (!block) return;
    block.dataset.visibleStartYear = building.visibleStartYear;

    const tenantsLayer = block.querySelector('.tenants-layer');
    const ownersLayer = block.querySelector('.owners-layer');

    tenantsLayer.replaceChildren();
    ownersLayer.replaceChildren();

    drawTimelines(building, block, tenantsLayer, ownersLayer);
    mergeNeighbourTenantTimelines(block);
    fixOverlayingLabels(block);
}

function drawTimelines(building, block, tenantsLayer, ownersLayer) {
    let maxTenantLevel = -1;
    const ticksLayer = block.querySelector('.timeline-ticks-layer');
    if (ticksLayer) {
        drawTimelineTicks(building, ticksLayer);
    }

    building.actors.forEach(actor => {
        const ownerTimeline = createTimeline(
            building,
            actor.ownership_start_year,
            actor.ownership_end_year,
            actor.owner,
            'owner-contract-timeline'
        );

        if (ownerTimeline) {
            ownersLayer.appendChild(ownerTimeline);
        }

        actor.tenants.forEach((tenant, index) => {
            const tenantTimeline = createTimeline(
                building,
                tenant.renting_start_year,
                tenant.renting_end_year,
                tenant.id,
                'tenant-contract-timeline'
            );

            if (tenantTimeline) {
                tenantTimeline.style.bottom = `${10 + index * 17}px`;
                tenantsLayer.appendChild(tenantTimeline);
                maxTenantLevel = Math.max(maxTenantLevel, index);
            }
        });
    });

    const hasTenants = maxTenantLevel >= 0;
    const tenantsHeight = hasTenants ? (20 + (maxTenantLevel + 1) * 17) : 0;

    const ownersHeight = 20;
    const mainHeight = 18;

    tenantsLayer.style.height = `${tenantsHeight}px`;
    ownersLayer.style.top = `${tenantsHeight}px`;
    block.style.height = `${tenantsHeight + ownersHeight + mainHeight}px`;
}

function drawTimelineTicks(building, ticksLayer) {
    ticksLayer.replaceChildren();

    const visibleStart = building.visibleStartYear;
    const visibleEnd = visibleStart + visibleYears;

    const firstYear = Math.ceil(visibleStart);
    const lastYear = Math.floor(visibleEnd);

    for (let year = firstYear; year <= lastYear; year++) {
        const tick = document.createElement('div');
        tick.className = 'timeline-tick';

        if (year % 5 === 0) {
            tick.classList.add('major-tick');

            const label = document.createElement('div');
            label.className = 'timeline-tick-label';
            label.textContent = year;

            tick.appendChild(label);
        }

        const percent = yearToPercent(year, visibleStart);
        tick.style.left = `${percent}%`;

        ticksLayer.appendChild(tick);
    }
}

function createTimeline(building, start, end, labelText, className) {
    const visibleStartYear = building.visibleStartYear;
    const visibleEndYear = visibleStartYear + visibleYears;

    start = Math.max(Number(start), visibleStartYear);
    end = Math.min(Number(end), visibleEndYear);

    if (start >= end) {
        return null;
    }

    const timeline = document.createElement('div');
    timeline.className = className;
    timeline.dataset.actorId = labelText;
    timeline.title = labelText;
    timeline.dataset.actorId = labelText;
    timeline.dataset.start = start;
    timeline.dataset.end = end;

    const startPercent = yearToPercent(start, visibleStartYear);
    const endPercent = yearToPercent(end, visibleStartYear);

    timeline.style.left = `${startPercent}%`;
    timeline.style.width = `${endPercent - startPercent}%`;

    const label = document.createElement('span');
    label.className = 'timeline-label';
    label.title = labelText;
    label.textContent = labelText;

    timeline.appendChild(label);

    return timeline;
}

function getFreeLabelLevel(timeline, timelines) {
    const start = Number(timeline.dataset.start);
    const end = Number(timeline.dataset.end);

    let level = 0;

    const busyLevels = timelines
        .filter(other => other !== timeline)
        .map(other => Number(other.dataset.labelLevel || 0));

    while (busyLevels.includes(level)) {
        level++;
    }

    timeline.dataset.labelLevel = level;

    return level;
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
            if (timeline) {
                timeline.style.setProperty('--slider-color', timelineColourSelected);
            }
        }
        console.log('frame hovered', building);
    });

    building.frame.addEventListener('mouseleave', () => {
        if (!building.isFramePinned) {
            building.frame.style.background = normalFrameBack;
            building.frame.style.zIndex = building.startZIndex;
            if (timeline) {
                timeline.style.setProperty('--slider-color', timelineColourNormal);
            }
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
            if (timeline) {
            timeline.style.setProperty('--slider-color', timelineColourNormal);
            }

        }

        // закрепляем новый
        building.isFramePinned = true;
        pinnedBuilding = building;

        building.frame.style.background = hoverColor;
        building.frame.style.zIndex = frontZ;
        if (timeline) {
        timeline.style.setProperty('--slider-color', timelineColourSelected);
        }

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


