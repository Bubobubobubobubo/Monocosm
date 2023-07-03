import type { Application } from './Application.js';

export class InputHandler {
    NormalKeyFunctions: Array<Function>;
    EditingKeyFunctions: Array<Function>;
    keyPresses: { [key: string]: boolean };
    textEditingMode: boolean;

    constructor(public app: Application) {
        this.keyPresses = {};
        this.textEditingMode = false;
        this.NormalKeyFunctions  = [
            this.keyDownHandler,
            this.keyUpHandler,
            this.keyLeftHandler,
            this.keyRightHandler,
            this.charInputHandler,
            this.backSpaceHandler,
            this.enterKeyHandler,
            this.altOHandler,
            this.altRHandler,
        ];
        this.EditingKeyFunctions = [];
        this.setupEventListeners();
    }

    setupEventListeners = () => {
        window.addEventListener('keydown', this.keyDownListener, false);
        window.addEventListener('keyup', this.keyUpListener, false);
    }

    keyDownListener = (event) => {
        this.app.redraw = true;
        this.keyPresses[event.key] = true;
        // Calling each registered key handler.
        let keybindings = this.textEditingMode ? this.EditingKeyFunctions : this.NormalKeyFunctions;
        keybindings.forEach(func => func(event));
    }

    keyUpListener = (event) => {
        this.keyPresses[event.key] = false;
    }

    altOHandler = (event) => {
        if (event.key == 'Alt' && (this.keyPresses['o'] || this.keyPresses['O'])) {
            // reset cursor position to origin
            this.app.context.cursor.x = 0;
            this.app.context.cursor.y = 0;
        }
    }

    altRHandler = (event) => {
        // Empty the table if shift + c is pressed
        if (event.key == 'Alt' && (this.keyPresses['r'] || this.keyPresses['R'])) {
            this.app.context.tables[this.app.context.current_table].clear();
        }
    }

    enterKeyHandler = (event) => {
        if (event.key == 'Enter') {
            this.app.context.cursor.y += 1;
            this.app.context.cursor.x -= 1;
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