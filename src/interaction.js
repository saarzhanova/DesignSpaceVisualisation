export function findActor(id, span, attributeSpace) {
    let frames = document.getElementsByClassName(id)
    console.log('frames', frames.length)
    for (let i = 0; i < frames.length; i++) {
        frames[i].isChosen = !frames[i].isChosen;

        if (frames[i].isChosen) {
            console.log('chosen frame:', frames[i].classList)
                frames[i].classList.add("chosen-frame");
                frames[i].classList.add(id[0]);
                frames[i].style.background = '#F7C1D8';
                span.style.fontWeight = 'bold';
                span.style.color = '#ec1763';
        } else {
            frames[i].classList.remove("chosen-frame");
            frames[i].style.background = '#f8c9dd';
            span.style.fontWeight = 'normal';
            checkFrameColor();
        }
    }
    checkFrameColor();
}

function checkFrameColor() {
    let allFrames = document.querySelectorAll('.frame');
    let hasChosen = document.querySelectorAll('.chosen-frame').length > 0;

    allFrames.forEach(frame => {
        if (hasChosen) {
            if (frame.classList.contains('chosen-frame')) {
                frame.style.background = '#F7C1D8';
                frame.style.opacity = '1';
            } else {
                frame.style.background = '#ceb7c2';
                frame.style.opacity = '0.45';
            }
        } else {
            frame.style.background = '#f8c9dd';
            frame.style.opacity = '1';
        }
    });
}