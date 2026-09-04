import { rebuildVisualLinks } from './lines.js';

export let visualLinks = [];

const rightFrame = document.getElementById('rightFrame');

export function setAttributeSpace(attributeSpace, year) {
    visualLinks.length = 0;

    rightFrame.innerHTML = '';

    for (let building of attributeSpace) {
        const visibleActors = building.actors.filter(actor => {
            return isBetween(year, actor.ownership_start_year, actor.ownership_end_year);
        });

        if (!visibleActors.length) continue;

        const buildingBlock = document.createElement('div');
        buildingBlock.className = 'right-building-block';

        visibleActors.forEach(actor => {
            const ownerBlock = document.createElement('div');
            ownerBlock.className = 'owner-block';

            const ownerTitle = document.createElement('span');
            ownerTitle.className = 'owner-title';
            ownerTitle.textContent = actor.owner;
            ownerBlock.appendChild(ownerTitle);

            const visibleTenants = actor.tenants.filter(tenant => {
                return isBetween(year, tenant.renting_start_year, tenant.renting_end_year);
            });

            const tenantsList = document.createElement('span');
            tenantsList.className = 'tenants-list';

            if (visibleTenants.length) {

                visibleTenants.forEach(tenant => {
                    const tenantItem = document.createElement('span');
                    tenantItem.textContent = tenant.id + ' ';
                    tenantItem.className = 'tenant-item';

                    tenantsList.appendChild(tenantItem);

                    visualLinks.push({
                        element: tenantItem,
                        building: building
                    });
                });

                ownerBlock.appendChild(tenantsList);
            } else {
                const noTenants = document.createElement('span');
                noTenants.className = 'no-tenants';
                noTenants.textContent = 'No tenants';
                tenantsList.appendChild(noTenants);
                ownerBlock.appendChild(tenantsList);

                visualLinks.push({
                    element: ownerTitle,
                    building: building
                });
            }

            buildingBlock.appendChild(ownerBlock);
        });

        rightFrame.appendChild(buildingBlock);
    }
    rebuildVisualLinks();
}

function isBetween(year, start, end) {
    return year >= Number(start) && year < Number(end);
}