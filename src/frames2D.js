import { view } from './myMap.js';

const THREE = itowns.THREE;

const labelsRoot = document.getElementById('labels');

function createLabel(text) {
    const el = document.createElement('div');
    el.textContent = text;
    labelsRoot.appendChild(el);
    return el;
}

function createLabelWithSlider() {
    const el = document.createElement('div');
    el.style.pointerEvents = 'auto'; //important
    el.style.background = 'white';
    el.style.padding = '8px';
    el.style.borderRadius = '8px';
    el.style.color = 'black';
    el.style.width = '150px';

    const sliderName = document.createElement('div');
    sliderName.textContent = "A";
    sliderName.style.position = 'absolute';
    sliderName.style.left = '10px';
    sliderName.style.marginTop = '6px';


    const slider = document.createElement('input');
    slider.id = 'slider1';
    slider.type = 'range';
    slider.min = '0';
    slider.max = '100';
    slider.value = '30';
    slider.style.width = '75%';
    slider.style.marginTop = '10px';
    slider.style.position = 'absolute';
    slider.style.left = '30px';

    const sliderName1 = document.createElement('div');
    sliderName1.textContent = "B";
    sliderName1.style.position = 'absolute';
    sliderName1.style.left = '10px';
    sliderName1.style.marginTop = '36px';


    const slider1 = document.createElement('input');
    slider1.type = 'range';
    slider1.min = '0';
    slider1.max = '100';
    slider1.value = '50';
    slider1.style.width = '75%';
    slider1.style.marginTop = '40px';
    slider1.style.position = 'absolute';
    slider1.style.left = '30px';

    const sliderName2 = document.createElement('div');
    sliderName2.textContent = "C";
    sliderName2.style.position = 'absolute';
    sliderName2.style.left = '10px';
    sliderName2.style.marginTop = '66px';

    const slider2 = document.createElement('input');
    slider2.type = 'range';
    slider2.min = '0';
    slider2.max = '100';
    slider2.value = '50';
    slider2.style.width = '75%';
    slider2.style.position = 'absolute';
    slider2.style.left = '30px';
    slider2.style.marginTop = '70px';

    el.appendChild(sliderName)
    el.appendChild(sliderName1)
    el.appendChild(sliderName2)
    el.appendChild(slider);
    el.appendChild(slider1);
    el.appendChild(slider2);

    labelsRoot.appendChild(el);
    return el;
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

// generate frame in another document, where I will filter what is represented on a frame
function fillFrame(actors) {
    let el = createFrame();

    let top = 40

    for (let i in actors) {
        let text = document.createElement('div');
        text.textContent = 'Building owners: ';
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

// const frame = createLabelWithSlider();
// const coordinates = new itowns.THREE.Vector3(
//     4200983.835123688,
//     172599.29286777228,
//     4780053.119140723
// );
// const frame2 = createLabelWithSlider();
// const coordinates2 = new itowns.THREE.Vector3(
//     4200679.473110186,
//     172553.76766474632,
//     4780349.824070254
// );
//
// const tempV = new THREE.Vector3();
//
// const frames = [{"frame": frame, "coordinates": coordinates}, {"frame": frame2, "coordinates": coordinates2}];

let frames = [];

let activeFrame = null;
const frontZ = 999999;
const hoverZ = 999998;

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

fetch('dataset.json')
    .then(response => response.json())
    .then(data => {
        console.log(data);
        for (let i in data.buildings) {
            let building = data.buildings[i];
            let buildingID = building.building_id;
            console.log(buildingID);

            let buildingOwners = [];
            for (let j in data.ownership_contracts) {
                if (data.ownership_contracts[j].building_id === buildingID) {
                    buildingOwners.push(data.ownership_contracts[j].owner_id)
                }
            }
            console.log(buildingOwners)

            let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('stroke', '#ec1763');
            line.setAttribute('stroke-width', '1');

            // let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            // path.setAttribute('stroke', '#ec1763');
            // path.setAttribute('stroke-width', '1');
            // path.setAttribute('fill', 'none');

            let frame = {
                "id": buildingID,
                "frame": fillFrame(buildingOwners),
                "coordinates": new itowns.THREE.Vector3(building.coordinates.x, building.coordinates.y, building.coordinates.z),
                "line": line
            }

            console.log(frame);

            if (frame.frame) {
                addFrameEvents(frame);
                frames.push(frame);
            }
        }
    })
    .catch(error => console.error('Error loading JSON:', error));


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


console.log(document.getElementById('labels'))

console.log(frames);
export { frames, THREE, tempV };


