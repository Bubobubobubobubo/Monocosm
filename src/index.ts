import { Application } from './Application.js';
import type { SavedContext } from './Types.js';
let INIT: boolean = false;

let application: Application = new Application('text');
let coordinates: HTMLElement = document.getElementById("coordinates") as HTMLElement;
let universe: HTMLElement = document.getElementById("universe") as HTMLElement;
let playButton: HTMLElement = document.getElementById("play") as HTMLElement;
let clock: HTMLElement = document.getElementById("clock") as HTMLElement;
let actionArea: HTMLElement = document.getElementById("actionarea") as HTMLElement;

playButton.addEventListener("click", function(){
    playButton.textContent = application.running ? "⏵" : "⏸" ;
    if (!application.running) {
        if (!INIT) application.startTime();
        application.audio_context!.resume();
    }
    if (application.running) {
        application.audio_context!.suspend();
    }
    application.running = !application.running;
}); 

window.onresize = () => {
    if (application.interface) application.interface.resizeGrid();
}

window.onbeforeunload = function(): null {
    let saved_context: SavedContext = application.save();
    localStorage.setItem('context', JSON.stringify(saved_context));
    return null;
}

function loop() {
    /* if(application.redraw) {
       REMOVED
    } */
    
    if (application.replaceGrid) {
        application.gridElement.replaceChildren(application.interface!.createWholeGrid());
        application.interface.updateCursorSize();
        application.interface.moveGrid(undefined, undefined);
    }

    // The clock should always move
    if (application.clock !== null) {
        application.updateTick(application.clock.toString());
    }
    window.requestAnimationFrame(loop);
}

function init() {       
    application.interface.createEditor('local');
    application.interface.createEditor('global');
    application.interface.createCursor();
}

init();

// First frame
loop();
