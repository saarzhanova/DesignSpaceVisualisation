import { loadAttributeSpace } from './attributeSpace.js';
import { setAttributeSpace } from './frames2D.js';
import { updatePath } from './lines.js';

const startYear = 1920;
const endYear = 1960;
const step = 5;

const yearSlider = document.getElementById('yearSlider');
const selectedYear = document.getElementById('selectedYear');
const ticks = document.getElementById('ticks');

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

export async function highlightOwnerStartYears(selectedOwners, attributeSpace) {
    console.log('timeline', attributeSpace);
    const ownerYearDots = document.getElementById('ownerYearDots');

    ownerYearDots.innerHTML = '';

    if (selectedOwners.size === 0) return;

    const years = new Set();

    attributeSpace.forEach(building => {
        building.actors.forEach(actors => {
            if (!selectedOwners.has(actors.owner)) return;

            const year = Number(actors.ownership_start_year);

            if (year >= startYear && year <= endYear) {
                years.add(year);
            }

        })

    })

    years.forEach(year => {
        const dot = document.createElement('div');
        dot.className = 'owner-year-dot';

        const percent = ((year - startYear) / (endYear - startYear)) * 100;
        dot.style.left = `${percent}%`;

        ownerYearDots.appendChild(dot);
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

    selectedYear.style.left = `${x}px`;
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