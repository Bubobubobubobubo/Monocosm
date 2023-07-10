import { Application } from './Application.js';
import type { SavedContext } from './Types.js';
import * as Tone from 'tone';

let application: Application = new Application('text');
let cursor: HTMLElement = document.getElementById("cursor") as HTMLElement;
let universe: HTMLElement = document.getElementById("universe") as HTMLElement;
let play_button: HTMLElement = document.getElementById("play") as HTMLElement;
let zone: HTMLElement = document.getElementById("zone") as HTMLElement;
let clock: HTMLElement = document.getElementById("clock") as HTMLElement;
let action_area: HTMLElement = document.getElementById("actionarea") as HTMLElement;


play_button.addEventListener("click", async () => {
    if (!application.running) {
    // application.startAudioContext();
    await Tone.start();
    play_button.textContent = "⏸";
    } else {
    play_button.textContent = "⏵";
    // application.audio_context.suspend();
    }
    application.running= !application;
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
        if (application.getCurrentTable().actionAreaAt(application.context.cursor.x, application.context.cursor.y)) {
            action_area.textContent = application.getCurrentTable().nameOfAreaAt(
                application.context.cursor.x, application.context.cursor.y);
        } else {
            action_area.textContent = "None"
        }
        cursor.textContent = application.context.cursor.toString();
        universe.textContent = `${application.context.current_table}`;
        const newContent = application.process();
        if (newContent) {
            zone.replaceChildren(newContent);
            // Focus cursor if in grid mode to enable paste
            if(application.gridMode == 'grid') application.interface?.focusCursor();
        }
    }
    // The clock should always move
    clock.textContent = application.clock.toString();
    window.requestAnimationFrame(loop);
}

// First frame
loop()