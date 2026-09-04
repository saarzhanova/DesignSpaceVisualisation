import { loadAttributeSpace } from './attributeSpace.js';
import { setAttributeSpace, activeBuilding, updateFrameByYear } from './framesEmbedTime.js';
import { updatePath } from './lines.js';


const startYear = 1920;
const endYear = 1960;
const step = 5;

const timelinesRoot = document.getElementById('timelines');

export function attachTimeline(item) {
    item.timeline = createTimelineForFrame(item);
    // timelinesRoot.appendChild(item.timeline);
    item.frame.appendChild(item.timeline);
}

export function createTimelineForFrame(item) {

    const timeline = document.createElement('div');
    timeline.className = 'frame-timeline';

    const yearSlider = document.createElement('input');
    yearSlider.className = 'frame-year-slider';
    yearSlider.type = 'range';
    yearSlider.min = '1920';
    yearSlider.max = '1960';
    yearSlider.value = '1935';
    yearSlider.addEventListener('click', (event) => {
        event.stopPropagation();
    });

    yearSlider.addEventListener('mousedown', (event) => {
        event.stopPropagation();
    });

    yearSlider.addEventListener('pointerdown', (event) => {
        event.stopPropagation();
    });

    const selectedYear = document.createElement('span');
    selectedYear.className = 'frame-selected-year';
    selectedYear.textContent = yearSlider.value;

    timeline.appendChild(yearSlider);
    timeline.appendChild(selectedYear);

    yearSlider.addEventListener('input', async () => {
        let year = Number(yearSlider.value);
        selectedYear.textContent = year;
        updateSelectedYearPosition(yearSlider, selectedYear);
        await sendYearToFrames(activeBuilding, year)
    });

    requestAnimationFrame(() => {
        updateSelectedYearPosition(yearSlider, selectedYear);
    });

    return timeline;
}

async function sendYearToFrames(building, year) {
    console.log('selectedYear', year, building)
    const attributeSpace = await loadAttributeSpace();
    updateFrameByYear(building, year, attributeSpace)
}

function updateSelectedYearPosition(yearSlider, selectedYear) {
    let year = selectedYear.textContent;
    const min = Number(yearSlider.min);
    const max = Number(yearSlider.max);
    const value = Number(yearSlider.value);

    const percent = (value - min) / (max - min);

    const sliderWidth = yearSlider.offsetWidth;
    const sliderLeft = yearSlider.offsetLeft;

    const thumbSize = 16;
    const usableWidth = sliderWidth - thumbSize;

    const x = sliderLeft + thumbSize / 2 + percent * usableWidth;

    selectedYear.style.left = `${x}px`;
}

async function updateYear(year) {
    const attributeSpace = await loadAttributeSpace();
    setAttributeSpace(attributeSpace, year);
}
await updateYear(1935);
