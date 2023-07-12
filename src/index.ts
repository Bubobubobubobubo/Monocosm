import { Application } from './Application.js';
import type { SavedContext } from './Types.js';
let INIT: boolean = false;

let application: Application = new Application('text');
let cursorLocation: HTMLElement = document.getElementById("cursor-location") as HTMLElement;
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
    if(application.redraw) {
        if (application.getCurrentTable().actionAreaAt(application.context.cursor.getX(), application.context.cursor.getY())) {
            actionArea.textContent = application.getCurrentTable().nameOfAreaAt(
                application.context.cursor.getX(), application.context.cursor.getY());
        } else {
            actionArea.textContent = "None"
        }
        cursorLocation.textContent = application.context.cursor.toString();
        universe.textContent = `${application.context.current_table}`;
        //const newContent = application.process();
        //if (newContent) {
            //application.zone.replaceChildren(newContent);
            // Focus cursor if in grid mode to enable paste
        //    if(application.gridMode == 'grid') application.interface?.focusCursor();
        //}
       
    }
    
    if(application.replaceGrid) {
        application.grid.replaceChildren(application.interface!.createWholeGrid());
        application.interface.moveGrid();
    }

    // The clock should always move
    if (application.clock !== null) {
        clock.textContent = application.clock.toString();
    }
    window.requestAnimationFrame(loop);
}

function init() {       
    application.cursor.replaceWith(application.interface!.createCursor());
}

init();

// First frame
loop();
