import type { Application } from './Application.js';
import { evaluate, evaluateCommand, tryEvaluate } from './Evaluator.js';

export class InputHandler {
    NormalKeyFunctions: Array<Function>;
    EditingKeyFunctions: Array<Function>;
    keyPresses: { [key: string]: boolean };
    textEditingMode: boolean;
    command_history: string[];
    current_command: string;
    isCapturingInput: boolean = true;

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
            // Tab input
            this.tabKeyHandler, this.shiftTabKeyHandler,
            // Regular ASCII input
            this.spaceKeyHandler,
            this.backSpaceHandler, this.enterKeyHandler,
            // Copy and paste mechanics
            this.copyHandler, this.pasteHandler, 
            this.pasteFromBeyondHandler,
            this.escapeKeyHandler,
            // Switch to command mode
            this.commandModeHandler,
            this.charInputHandler, 
        ];
        this.EditingKeyFunctions = [
            this.editingModeKeysHandler,
            this.validateCommandHandler,
            this.commandModeHandler,
        ];

        // Setting up event listeners on the window
        this.setupEventListeners();
    }

    disable = (): void => {
        this.isCapturingInput = false;
    }

    enable = (): void => {
        this.isCapturingInput = true;
    }

    setupEventListeners = (): void => {
        window.addEventListener('keydown', this.keyDownListener, false);
        window.addEventListener('keyup', this.keyUpListener, false);
    }

    tabKeyHandler = (event: KeyboardEvent): void => {
        // This key will be used to switch to script mode
        if (event.key == 'Tab' && !this.keyPresses['Shift']) {
            event.preventDefault();
            if (this.app.gridMode === 'grid') {
                this.app.gridMode = 'local';
            } else if (this.app.gridMode == 'global') {
                this.app.gridMode = 'local'
            } else {
                this.app.gridMode = 'grid';
            } 
            this.isCapturingInput = !this.isCapturingInput;
        }
    }

    shiftTabKeyHandler = (event: KeyboardEvent): void => {
        // This key will be used for something else
        if (event.key == 'Tab' && this.keyPresses['Shift']) {

            if (this.app.gridMode === 'grid') {
                this.app.gridMode = 'global';
            } else if (this.app.gridMode === 'local') {
                this.app.gridMode = 'global'
            } else {
                this.app.gridMode = 'grid'
            }
            this.isCapturingInput = !this.isCapturingInput;
            event.preventDefault();
        }
    }

    keyDownListener = (event: KeyboardEvent): void => {
        this.app.redraw = true;
        this.keyPresses[event.key] = true;
        let keybindings = this.textEditingMode ? this.EditingKeyFunctions : this.NormalKeyFunctions;
        if (this.isCapturingInput) {
            keybindings.forEach(func => func(event));
        } else {
            const authorizedFunctions = [
                this.tabKeyHandler, 
                this.shiftTabKeyHandler, 
                this.submitCodeHandler
            ];
            authorizedFunctions.forEach(func => func(event));

        }
    }

    keyUpListener = (event: KeyboardEvent):void => {
        this.keyPresses[event.key] = false;
    }

    submitCodeHandler = (event: KeyboardEvent):void => {
        if (event.key == 'Enter' && this.keyPresses['Control']) {
            console.log('Submitting code...')
            let editor = document.getElementsByClassName('cm-editor')[0] as HTMLElement;
            if (editor) {
                editor.style.animation  = "blinker 0.1s linear" ;
                setTimeout(() => {
                    editor.style.animation=""; 
                }, 100);
            }
            if (this.app.gridMode == 'local') {
                tryEvaluate(this.app, this.app.getCurrentTable().script)
            } else if (this.app.gridMode == 'global') {
                tryEvaluate(this.app, this.app.context.mainScript)
            }
        }
    }

    commandModeHandler = (event: KeyboardEvent):void => {
        if ((event.key == "F1" || event.key == '§' || event.key == '²') && this.textEditingMode == false) {
            if (this.app.output_type == 'text') {
                let prompt = document.getElementById('prompt');
                prompt?.classList.toggle('unselected');
                prompt?.classList.toggle('selected');
            }
            this.textEditingMode = !this.textEditingMode;
        }
    }

    validateCommandHandler = (event:KeyboardEvent):void => {
        if (event.key == 'Enter') {

            // Fetching the prompt element (HTMLInput or whatever)
            if (this.app.output_type == 'text') {
                let prompt = document.getElementById('prompt') as HTMLInputElement;
                this.current_command = String(prompt?.value);
                prompt.value = '';
                prompt.disabled = true;
            }

            // Actual logic
            evaluateCommand(this.app, this.current_command);
            this.command_history.push(this.current_command);
            this.textEditingMode = !this.textEditingMode;
            this.current_command = '';

            // Style the prompt
            if (this.app.output_type == 'text') {
                let prompt = document.getElementById('prompt') as HTMLInputElement;
                prompt.classList.toggle('selected');
                prompt.classList.toggle('unselected');
            }
        }
    }

    escapeKeyHandler = (event:KeyboardEvent):void => {
        if (event.key == 'Escape') {
            this.app.context.cursor.resetCursorSize();
        }
    }

    copyHandler = (event:KeyboardEvent):void => {
        if (event.key == 'c' && this.keyPresses['Control']) {
            this.app.context.tables[this.app.context.current_table].copyUnderCursor();
        }
    }

    pasteHandler = (event:KeyboardEvent):void => {
        if (event.key == 'v' && this.keyPresses['Control']) {
            this.app.context.tables[this.app.context.current_table].paste();
        }
    }

    pasteFromBeyondHandler = (event:KeyboardEvent):void => {
        if (event.key == 'b' && (this.keyPresses['Control'] || this.keyPresses['Meta'])) {
            this.app.context.cursor.resetCursorSize();
            event.preventDefault();
            this.app.context.tables[this.app.context.current_table].pasteFromBeyond();
        }
    }
    
    editingModeKeysHandler = ():void => {
        if (this.app.output_type == 'text') {
            let prompt = document.getElementById('prompt') as HTMLInputElement;
            prompt.disabled = false;
            prompt.focus();
        }
    }

    spaceKeyHandler = (event:KeyboardEvent):void => {
        if (event.key == ' ') {
            this.app.context.cursor.x += 1;
        }
    }

    enterKeyHandler = (event:KeyboardEvent):void => {
        if (event.key == 'Enter') {
            this.app.context.cursor.y += 1;
            this.app.context.cursor.x -= 1;
        }
    }

    backSpaceHandler = (event:KeyboardEvent):void => {
        if (event.key === "Backspace") {
            if (this.app.context.cursor.x_size == 1 && this.app.context.cursor.y_size == 1) {
                this.app.context.tables[this.app.context.current_table].removeCell(
                    this.app.context.cursor.x, this.app.context.cursor.y);
                this.app.context.cursor.x -= 1;
            } else {
                this.app.context.tables[this.app.context.current_table].removeZone(
                    this.app.context.cursor.x, this.app.context.cursor.y,
                    this.app.context.cursor.x_size, this.app.context.cursor.y_size
                )
                this.app.context.cursor.x -= 1;
            }
        }
    }

    charInputFilter = (event:KeyboardEvent):boolean => {
        let forbiddenKeys = "§²"
        return forbiddenKeys.includes(event.key)? false : true;
    }

    charInputHandler = (event:KeyboardEvent):void => {
        if (event.key.length == 1 && (!this.keyPresses['Control'] || !this.keyPresses['Meta'])) {
            if (event.key.match(/^[\x21-\x7E]$/)) {
                if (this.charInputFilter(event)) {
                    this.app.context.tables[this.app.context.current_table].addCell(
                        this.app.context.cursor.x, this.app.context.cursor.y, event.key
                    );
                    this.app.context.cursor.x += 1;
                }
            }
        }
    }

    keyDownHandler = (event:KeyboardEvent):void => {
        if (event.key == 'ArrowDown' && this.keyPresses['Shift']) {
            this.app.context.cursor.y += 5;
        } else if (event.key == 'ArrowDown' && this.keyPresses['Control']) {
            this.app.context.cursor.y_size += 1;
        } else if (event.key == 'ArrowDown') {
            this.app.context.cursor.y += 1;
        }
    }
    
    keyUpHandler = (event:KeyboardEvent):void => {
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

    keyLeftHandler = (event:KeyboardEvent):void => {
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

    keyRightHandler = (event:KeyboardEvent):void => {
        if (event.key == 'ArrowRight' && this.keyPresses['Shift']) {
            this.app.context.cursor.x += 5;
        } else if (event.key == 'ArrowRight' && this.keyPresses['Control']) {
            this.app.context.cursor.x_size += 1;
        } else if (event.key == 'ArrowRight') {
            this.app.context.cursor.x += 1;
        }
    }
}