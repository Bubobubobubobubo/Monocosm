import { Application } from './Application.js';
import type { SavedContext } from './Types.js';
console.log('Loading application');
let application: Application = new Application();

window.onbeforeunload = function(): null {
    let saved_context: SavedContext = application.save();
    localStorage.setItem('context', JSON.stringify(saved_context));
    return null;
}

window.onclick = function(): null {
    application.startTime();
}