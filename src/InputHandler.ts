import type { Application } from './Application.js';

export class InputHandler {
    listeners: { [key: string]: (event) => void };

    constructor(public app: Application) {
        this.listeners = {
            'keydown': this.keyDownHandler,
            'keyup': this.keyUpHandler,
            'keyleft': this.keyLeftHandler,
            'keyright': this.keyRightHandler,
        }
        this.setup();
    }

    setup = () => {
        for (const listener in this.listeners) {
            window.addEventListener("keydown", this.listeners[listener]);
        }
    }

    keyDownHandler = (event) => {
        if (event.key == 'ArrowDown') {
            this.app.context.cursor.y -= 1;
        }
    }

    keyUpHandler = (event) => {
        if (event.key == 'ArrowUp') {
            this.app.context.cursor.y += 1;
        }
    }
    keyLeftHandler = (event) => {
        if (event.key == 'ArrowLeft') {
            this.app.context.cursor.x -= 1;
        }
    }
    keyRightHandler = (event) => {
        if (event.key == 'ArrowRight') {
            this.app.context.cursor.x += 1;
        }
    }
}