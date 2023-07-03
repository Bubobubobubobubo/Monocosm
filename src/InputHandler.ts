import type { Application } from './Application.js';

export class InputHandler {
    listeners: { [key: string]: (event) => void };

    constructor(public app: Application) {
        this.listeners = {
            'keydown': this.keyDownHandler,
            'keyup': this.keyUpHandler,
            'keyleft': this.keyLeftHandler,
            'keyright': this.keyRightHandler,
            'charInput': this.charInputHandler,
            'backSpace': this.backSpaceHandler,
        }
        this.setup();
    }

    setup = () => {
        for (const listener in this.listeners) {
            window.addEventListener("keydown", this.listeners[listener]);
        }
    }

    backSpaceHandler = (event) => {
        if (event.key == 'Backspace') {
            this.app.context.cursor.x -= 1;
            this.app.context.tables[this.app.context.current_table].removeCell(
                this.app.context.cursor.x, this.app.context.cursor.y);
        }
    }

    charInputHandler = (event) => {
        // Check if key in alphabet or number
        // Do not capture arrows or special keys
        if (event.key.length == 1) {
            if (event.key.match(/[a-z0-9 ]/i)) {
                this.app.context.tables[this.app.context.current_table].addCell(this.app.context.cursor.x, this.app.context.cursor.y, event.key);
                this.app.context.cursor.x += 1;
            }
        }

    }

    keyDownHandler = (event) => {
        if (event.key == 'ArrowDown') {
            this.app.context.cursor.y += 1;
        }
    }

    keyUpHandler = (event) => {
        if (event.key == 'ArrowUp') {
            this.app.context.cursor.y -= 1;
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