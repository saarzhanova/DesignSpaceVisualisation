let selectedActors = new Set();
let selectedSpans = new Map();
import { highlightOwnerTimeline } from './timeline.js';

export function findActor(id, span, attributeSpace) {
    if (selectedActors.has(id)) {
        selectedActors.delete(id);
        selectedSpans.delete(id);

        span.style.fontWeight = 'normal';
    } else {
        selectedActors.add(id);
        selectedSpans.set(id, span);

        span.style.fontWeight = 'bold';
    }

    checkFrameColor();
    void highlightOwnerTimeline(selectedActors, attributeSpace);
}

function checkFrameColor() {
    let allFrames = document.querySelectorAll('.frame');

    if (selectedActors.size === 0) {
        allFrames.forEach(frame => {
            frame.classList.remove('chosen-frame');
            frame.style.background = '#f8c9dd';
            frame.style.opacity = '1';
        });

        return;
    }

    allFrames.forEach(frame => {
        let isSelected = false;

        selectedActors.forEach(actorId => {
            if (frame.classList.contains(actorId)) {
                isSelected = true;
            }
        });

        if (isSelected) {
            frame.classList.add('chosen-frame');
            frame.style.background = '#F7C1D8';
            frame.style.opacity = '1';
        } else {
            frame.classList.remove('chosen-frame');
            frame.style.background = '#ceb7c2';
            frame.style.opacity = '0.45';
        }
    });
}