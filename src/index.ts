import { Application } from './Application.js';
import type { OutputType } from './Application.js';

let application: Application = new Application('text');
let cursor: HTMLElement = document.getElementById("cursor");
let visible_zone: HTMLElement = document.getElementById("visibleZone");

let zone: HTMLElement = document.getElementById("zone");


function drawScreen() {
    return application.process();
}

window.onresize = () => {
    application.interface.resizeGrid();
}

window.addEventListener('onbeforeunload', (event): null => {
    event.preventDefault();
    application.save();
    return null;
});

function loop() {
    if(application.redraw) {
        cursor.innerHTML = application.context.cursor.toString();
        visible_zone.innerHTML = application.context.camera.getVisibleZoneToString();
        zone.innerHTML = drawScreen();
    }
    window.requestAnimationFrame(loop);
}

// First frame
loop()