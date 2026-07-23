import { loadAttributeSpace } from './attributeSpace.js';
import { setAttributeSpace } from './frames2D.js';
import { updatePath } from './lines.js';

const startYear = 1920;
const endYear = 1960;
const step = 5;

const yearSlider = document.getElementById('yearSlider');
const selectedYear = document.getElementById('selectedYear');
const ticks = document.getElementById('ticks');
const timeline = document.getElementById('timeline')

const ownerColors = [
    '#ec1763',
    '#f45b93',
    '#d946ef',
    '#fb7185',
    '#c026d3',
    '#f97316',
    '#8b5cf6'
];

let ownerColorMap = new Map();

function getOwnerColor(ownerId) {
    if (!ownerColorMap.has(ownerId)) {
        const index = ownerColorMap.size % ownerColors.length;
        ownerColorMap.set(ownerId, ownerColors[index]);
    }

    return ownerColorMap.get(ownerId);
}

for (let year = startYear + step; year <= endYear - step; year += step) {
    let tick = document.createElement('div');
    tick.className = 'tick';
    let percent = ((year - startYear) / (endYear - startYear)) * 100;
    tick.style.left = `${percent}%`;

    let tickLabel = document.createElement('div');
    tickLabel.className = 'tickLabel';
    tickLabel.textContent = year;

    // tick.appendChild(tickLabel);
    ticks.appendChild(tick);
}
yearSlider.addEventListener('input', async () => {
    const year = Number(yearSlider.value);
    selectedYear.textContent = year;
    updateSelectedYearPosition();

    await updateYear(year);
});

export async function highlightOwnerTimeline(selectedOwners, attributeSpace) {
    console.log('timeline', attributeSpace);
    // const ownerYearDots = document.getElementById('ownerYearDots');
    const rangesLayer = document.getElementById('ownerYearRanges');

    rangesLayer.innerHTML = '';

    if (selectedOwners.size === 0) {
        rangesLayer.innerHTML = '';

        timeline.style.paddingTop = '14px';
        timeline.style.height = 'auto';

        return;
    }

    const years = new Set();

    let rangeIndex = 0;

    const groupedContracts = new Map();

    attributeSpace.forEach(building => {
        building.actors.forEach(actors => {
            let owner = actors.owner
            if (!selectedOwners.has(owner)) return;

            if (!groupedContracts.has(owner)) {
                groupedContracts.set(owner, []);
            }

            groupedContracts.get(owner).push({
                actors: actors,
                buildingId: building.id
            });
        })
    })

    let rowIndex = 0;

    groupedContracts.forEach((actors, ownerId) => {
        const color = '#5568af';
        const ownerStartRow = rowIndex;

        const label = document.createElement('div');
        label.className = 'owner-timeline-label';
        label.textContent = ownerId;
        label.style.top = `${ownerStartRow * 18}px`;
        label.style.color = color;
        rangesLayer.appendChild(label);


        actors.forEach(item => {
            let actors = item.actors;
            let start = Number(actors.ownership_start_year);
            let end = Number(actors.ownership_end_year);

            if (!end) end = endYear;

            start = Math.max(start, startYear);
            end = Math.min(end, endYear);

            if (start > end) return;

            const startPercent = ((start - startYear) / (endYear - startYear)) * 100;
            const endPercent = ((end - startYear) / (endYear - startYear)) * 100;

            const range = document.createElement('div');
            range.className = 'owner-year-range';
            range.dataset.owner = ownerId;
            range.dataset.building = item.buildingId;

            range.style.left = `${startPercent}%`;
            range.style.width = `${endPercent - startPercent}%`;
            range.style.top = `${rowIndex * 18}px`;

            range.style.background = color;
            range.style.boxShadow = `0 0 6px ${color}`;

            rangesLayer.appendChild(range);

            rowIndex++;
        });

        const divider = document.createElement('div');
        divider.className = 'owner-timeline-divider';
        divider.style.top = `${rowIndex * 18}px`;

        rangesLayer.appendChild(divider);
        rowIndex++;
    });

    timeline.style.paddingTop = `${14 + rowIndex * 18}px`;
}

export function highlightTimelineOwners(buildingItem) {
    const ranges = document.querySelectorAll('.owner-year-range');

    ranges.forEach(range => {
        if (range.dataset.building === buildingItem.id) {
            range.classList.add('timeline-hovered');
        } else {
            range.classList.remove('timeline-hovered');
        }
    });
}

export function clearTimelineOwnerHighlight() {
    document.querySelectorAll('.owner-year-range').forEach(range => {
        range.classList.remove('timeline-hovered');
    });
}

function updateSelectedYearPosition() {
    const min = Number(yearSlider.min);
    const max = Number(yearSlider.max);
    const value = Number(yearSlider.value);

    const percent = (value - min) / (max - min);

    const sliderRect = yearSlider.getBoundingClientRect();
    const timelineRect = document.getElementById('timeline').getBoundingClientRect();

    const x = sliderRect.left - timelineRect.left + percent * sliderRect.width;

    selectedYear.style.left = `${x + 2}px`;
}

async function updateYear(year) {
    selectedYear.textContent = year;

    const attributeSpace = await loadAttributeSpace(year);
    setAttributeSpace(attributeSpace, year);

    requestAnimationFrame(() => {
        updatePath();
    });
}

selectedYear.textContent = yearSlider.value;
updateSelectedYearPosition();
await updateYear(Number(yearSlider.value));