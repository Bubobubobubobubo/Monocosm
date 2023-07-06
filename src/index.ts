import { Application } from './Application.js';
import type { SavedContext } from './Application.js';

let RUNNING: boolean = false;

let application: Application = new Application('text');
let cursor: HTMLElement = document.getElementById("cursor");
let universe: HTMLElement = document.getElementById("universe");
let prompt: HTMLElement = document.getElementById("prompt");
let play_button: HTMLElement = document.getElementById("play"); 
let zone: HTMLElement = document.getElementById("zone");

play_button.addEventListener("click", () => {
    if (!RUNNING) {
    application.startAudioContext();
    play_button.innerHTML = "⏸";
    RUNNING = !RUNNING;
    } else {
    play_button.innerHTML = "⏵";
    application.audio_context.suspend();
    RUNNING = !RUNNING;
    }
}); 


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