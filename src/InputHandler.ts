import type { Application } from './Application.js';

export class InputHandler {
    NormalKeyFunctions: Array<Function>;
    EditingKeyFunctions: Array<Function>;
    keyPresses: { [key: string]: boolean };
    textEditingMode: boolean;
    command_history: string[];
    current_command: string;

    constructor(public app: Application) {
        // Command-line mode properties
        this.command_history = [];
        this.current_command = '';
        this.textEditingMode = false;

        // Storage for pressed keys
        this.keyPresses = {};

        // List of possible keyHandlers for each mode
        this.NormalKeyFunctions  = [
            // Directional input
            this.keyDownHandler, this.keyUpHandler,
            this.keyLeftHandler, this.keyRightHandler,
            // Regular ASCII input
            this.charInputHandler, this.spaceKeyHandler,
            this.backSpaceHandler, this.enterKeyHandler,
            // Copy and paste mechanics
            this.copyHandler, this.pasteHandler,
            // Alt controls
            this.altOHandler, this.altRHandler,
            // Switch to command mode
            this.commandModeHandler,
        ];
        this.EditingKeyFunctions = [
            this.editingModeKeysHandler,
            this.validateCommandHandler,
            this.commandModeHandler,
        ];
        
        // Setting up event listeners on the window
        this.setupEventListeners();
    }

    setupEventListeners = (): void => {
        window.addEventListener('keydown', this.keyDownListener, false);
        window.addEventListener('keyup', this.keyUpListener, false);
    }

    keyDownListener = (event): void => {
        this.app.redraw = true;
        this.keyPresses[event.key] = true;
        let keybindings = this.textEditingMode ? this.EditingKeyFunctions : this.NormalKeyFunctions;
        keybindings.forEach(func => func(event));
    }

    keyUpListener = (event):void => {
        this.keyPresses[event.key] = false;
    }

    commandModeHandler = (event):void => {
        if (event.key == '!') {
            console.log('Switching to command mode');
            this.textEditingMode = !this.textEditingMode;
        }
    }

    validateCommandHandler = (event):void => {
        if (event.key == 'Enter') {
            this.command_history.push(this.current_command);
            this.textEditingMode = !this.textEditingMode;
            this.current_command = '';
        }
    }

    copyHandler = (event):void => {
        if (event.key == 'c' && this.keyPresses['Control']) {
            this.app.context.tables[this.app.context.current_table].copy();
        }
    }

    pasteHandler = (event):void => {
        if (event.key == 'v' && this.keyPresses['Control']) {
            this.app.context.tables[this.app.context.current_table].paste();
        }
    }

    editingModeKeysHandler = (event):void => {
        // Filter event.key to only include alphanumeric characters
        if (event.key.match(/^[a-zA-Z0-9]+$/)) {
            if (this.current_command.length < 80) {
                this.current_command = this.current_command + event.key;
            }
        }
    }

    spaceKeyHandler = (event):void => {
        if (event.key == ' ') {
            this.app.context.cursor.x += 1;
        }
    }

    altOHandler = (event):void => {
        if (event.key == 'Alt' && (this.keyPresses['o'] || this.keyPresses['O'])) {
            // reset cursor position to origin
            this.app.context.cursor.x = 0;
            this.app.context.cursor.y = 0;
        }
    }

    altRHandler = (event):void => {
        // Empty the table if shift + c is pressed
        if (event.key == 'Alt' && (this.keyPresses['r'] || this.keyPresses['R'])) {
            this.app.context.tables[this.app.context.current_table].clear();
        }
    }

    enterKeyHandler = (event):void => {
        if (event.key == 'Enter') {
            this.app.context.cursor.y += 1;
            this.app.context.cursor.x -= 1;
        }
    }

    backSpaceHandler = (event):void => {
        if (event.key == 'Backspace') {
            this.app.context.cursor.x -= 1;
            this.app.context.tables[this.app.context.current_table].removeCell(
                this.app.context.cursor.x, this.app.context.cursor.y);
        }
    }

    charInputHandler = (event):void => {
        // Check if key in alphabet or number
        // Do not capture arrows or special keys
        if (event.key.length == 1) {
            if (event.key.match(/^[\x21-\x7E]$/)) {
                this.app.context.tables[this.app.context.current_table].addCell(this.app.context.cursor.x, this.app.context.cursor.y, event.key);
                this.app.context.cursor.x += 1;
            }
        }
    }

    keyDownHandler = (event):void => {
        if (event.key == 'ArrowDown' && this.keyPresses['Shift']) {
            this.app.context.cursor.y += 5;
        } else if (event.key == 'ArrowDown' && this.keyPresses['Control']) {
            this.app.context.cursor.y_size += 1;
        } else if (event.key == 'ArrowDown') {
            this.app.context.cursor.y += 1;
        }
    }
    
    keyUpHandler = (event):void => {
        if (event.key == 'ArrowUp' && this.keyPresses['Shift']) {
            this.app.context.cursor.y -= 5;
        } else if (event.key == 'ArrowUp' && this.keyPresses['Control']) {
            if (this.app.context.cursor.y_size > 1) {
                this.app.context.cursor.y_size -= 1;
            }
        } else if (event.key == 'ArrowUp') {
            this.app.context.cursor.y -= 1;
        }
    }

    keyLeftHandler = (event):void => {
        if (event.key == 'ArrowLeft' && this.keyPresses['Shift']) {
            this.app.context.cursor.x -= 5;
        } else if (event.key == 'ArrowLeft' && this.keyPresses['Control']) {
            if (this.app.context.cursor.x_size > 1) {
                this.app.context.cursor.x_size -= 1;
            }
        } else if (event.key == 'ArrowLeft') {
            this.app.context.cursor.x -= 1;
        }
    }

    keyRightHandler = (event):void => {
        if (event.key == 'ArrowRight' && this.keyPresses['Shift']) {
            this.app.context.cursor.x += 5;
        } else if (event.key == 'ArrowRight' && this.keyPresses['Control']) {
            this.app.context.cursor.x_size += 1;
        } else if (event.key == 'ArrowRight') {
            this.app.context.cursor.x += 1;
        }
    }
}