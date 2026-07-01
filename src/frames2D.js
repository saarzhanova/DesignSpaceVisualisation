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
const FRONT_Z = 999999;
const HOVER_Z = 999998;

function addFrameEvents(item) {
    item.isPinned = false;
    item.baseZIndex = 0;

    item.frame.addEventListener('mouseenter', () => {
        if (!item.isPinned) {
            item.frame.style.zIndex = HOVER_Z;
        }
    });

    item.frame.addEventListener('mouseleave', () => {
        if (!item.isPinned) {
            item.frame.style.zIndex = item.baseZIndex;
        }
    });

    item.frame.addEventListener('click', () => {
        console.log('clicked FRAME');

        item.isPinned = !item.isPinned;

        if (item.isPinned) {
            activeFrame = item;
            item.frame.style.zIndex = FRONT_Z;
        } else {
            activeFrame = null;
            item.frame.style.zIndex = item.baseZIndex;
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

            let frame = {
                "frame": createLabelWithSlider(),
                "coordinates": new itowns.THREE.Vector3(building.coordinates.x, building.coordinates.y, building.coordinates.z)
            }

            addFrameEvents(frame);
            console.log(frame);

            frames.push(frame);
        }
    })
    .catch(error => console.error('Error loading JSON:', error));
console.log(frames);

const tempV = new THREE.Vector3();

function updateLabels() {
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

    // layering frames

    // frames[i].frame.style.zIndex = ((-tempV.z * 0.5 + 0.5) * 100000) | 0;

    const baseZ = ((-tempV.z * 0.5 + 0.5) * 100000) | 0;
    frames[i].baseZIndex = baseZ;

    if (frames[i].isPinned) {
        frames[i].frame.style.zIndex = FRONT_Z;
    } else {
        frames[i].frame.style.zIndex = baseZ;
    }
    }
}

view.addFrameRequester(itowns.MAIN_LOOP_EVENTS.AFTER_RENDER, updateLabels);


console.log(document.getElementById('labels'))




