import { Application } from './Application.js';
let application = new Application('text');
let cursor = document.getElementById("cursor");
let visible_zone = document.getElementById("visibleZone");
let zone = document.getElementById("zone");
function drawScreen() {
    return application.process();
}
function loop() {
    zone.innerHTML = "";
    cursor.innerHTML = application.context.cursor.toString();
    visible_zone.innerHTML = application.context.camera.getVisibleZoneToString();
    zone.innerHTML = drawScreen();
    window.requestAnimationFrame(loop);
}
// First frame
loop();
