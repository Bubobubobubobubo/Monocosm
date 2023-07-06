import { Application } from './Application.js';
import type { SavedContext } from './Application.js';

let application: Application = new Application('text');
let cursor: HTMLElement = document.getElementById("cursor");
let universe: HTMLElement = document.getElementById("universe");
let prompt: HTMLElement = document.getElementById("prompt");


let zone: HTMLElement = document.getElementById("zone");


function start() {
    application.startAudioContext();
}

function drawScreen() {
    return application.process();
}

window.onresize = () => {
    application.interface.resizeGrid();
}

window.onbeforeunload = function(event): null {
    let saved_context: SavedContext = application.save();
    localStorage.setItem('context', JSON.stringify(saved_context));
    return null;
}

function loop() {
    if(application.redraw) {
        cursor.innerHTML = application.context.cursor.toString();
        universe.innerHTML = `${application.context.current_table}`;
        zone.innerHTML = drawScreen();
    }
    window.requestAnimationFrame(loop);
}

// First frame
loop()