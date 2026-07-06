let year = 1930

export async function loadAttributeSpace(year) {
    const response = await fetch('dataset.json');
    const data = await response.json();

    console.log(data);
    let attributeSpace = [];

    for (let i in data.buildings) {
        let building = data.buildings[i];
        let buildingID = building.building_id;

        let buildingOwners = [];


        for (let j in data.ownership_contracts) {
            if (data.ownership_contracts[j].building_id === buildingID) {

                let startYear = data.ownership_contracts[j].ownership_start_year;
                let endYear = data.ownership_contracts[j].ownership_end_year;

                if (isBetween(year, startYear, endYear)) {
                    console.log(buildingID, data.ownership_contracts[j].building_id, year,startYear, endYear)
                    console.log(data.ownership_contracts[j])
                    buildingOwners.push(data.ownership_contracts[j].owner_id)
                } else if (!year) {
                    buildingOwners.push(data.ownership_contracts[j].owner_id)
                }
            }
        }

        let buildingData = {
            "id": buildingID,
            "owners": buildingOwners,
            "coordinates": new itowns.THREE.Vector3(building.coordinates.x, building.coordinates.y, building.coordinates.z),
            "line": createLine()
        }

        if (buildingData.owners.length) {
            attributeSpace.push(buildingData);
        }
    }
    return attributeSpace;
}

function isBetween(n, start, end) {
    return (n >= start && n < end)
}

function createLine() {
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('stroke', '#ec1763');
    line.setAttribute('stroke-width', '1');

    // let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    // path.setAttribute('stroke', '#ec1763');
    // path.setAttribute('stroke-width', '1');
    // path.setAttribute('fill', 'none');

    return line;
}







// fetch('dataset.json')
//     .then(response => response.json())
//     .then(data => {
//         console.log(data);
//         for (let i in data.buildings) {
//             let building = data.buildings[i];
//             let buildingID = building.building_id;
//             console.log(buildingID);
//
//             let buildingOwners = [];
//             for (let j in data.ownership_contracts) {
//                 if (data.ownership_contracts[j].building_id === buildingID) {
//                     buildingOwners.push(data.ownership_contracts[j].owner_id)
//                 }
//             }
//             console.log(buildingOwners)
//
//             let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
//             line.setAttribute('stroke', '#ec1763');
//             line.setAttribute('stroke-width', '1');
//
//             // let path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
//             // path.setAttribute('stroke', '#ec1763');
//             // path.setAttribute('stroke-width', '1');
//             // path.setAttribute('fill', 'none');
//
//             let frame = {
//                 "id": buildingID,
//                 "frame": fillFrame(buildingOwners),
//                 "coordinates": new itowns.THREE.Vector3(building.coordinates.x, building.coordinates.y, building.coordinates.z),
//                 "line": line
//             }
//
//             console.log(frame);
//
//             if (frame.frame) {
//                 addFrameEvents(frame);
//                 frames.push(frame);
//             }
//         }
//     })
//     .catch(error => console.error('Error loading JSON:', error));


