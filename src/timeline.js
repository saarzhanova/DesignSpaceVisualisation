import { loadAttributeSpace } from './attributeSpace.js';
import { setAttributeSpace } from './frames2D.js';
import { updatePath } from './lines.js';

const yearSlider = document.getElementById('yearSlider');
const selectedYear = document.getElementById('selectedYear');

async function updateYear(year) {
    selectedYear.textContent = year;

    const attributeSpace = await loadAttributeSpace(year);
    setAttributeSpace(attributeSpace);
    updatePath();
}

yearSlider.addEventListener('input', async () => {
    const year = Number(yearSlider.value);
    await updateYear(year);
});

await updateYear(Number(yearSlider.value));