import type { Application } from './Application.js';
import { evaluateCommand, tryEvaluate } from './Evaluator.js';

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
            this.escapeKeyHandler,
            // Switch to command mode
            this.commandModeHandler,
            this.charInputHandler, 
            // Creating and managing zones
            this.createZoneHandler,
            // Scroll tables with page up and page down
            this.pageDownHandler, this.pageUpHandler,
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
                let editor = document.getElementById('local');
                if(editor) editor.style.visibility = 'visible'
                this.app.interface.localEditor.focus();
            } else if (this.app.gridMode == 'global') {
                this.app.gridMode = 'local'

                let globalEditor = document.getElementById('global');
                if(globalEditor) globalEditor.style.visibility = 'hidden'

                let localEditor = document.getElementById('local');
                if(localEditor) localEditor.style.visibility = 'visible'

                this.app.interface.localEditor.focus();
            } else {
                this.app.gridMode = 'grid';
                let localEditor = document.getElementById('local');
                if(localEditor) localEditor.style.visibility = 'hidden'
            } 
            this.isCapturingInput = !this.isCapturingInput;
        }
    }

    shiftTabKeyHandler = (event: KeyboardEvent): void => {
        // This key will be used for something else
        if (event.key == 'Tab' && this.keyPresses['Shift']) {
            let globalEditor = document.getElementById('global');
            if (this.app.gridMode === 'grid') {
                this.app.gridMode = 'global';
                if(globalEditor) globalEditor.style.visibility = 'visible'
                this.app.interface.globalEditor.focus();
            } else if (this.app.gridMode === 'local') {
                this.app.gridMode = 'global'

                let localEditor = document.getElementById('local');
                if(localEditor) localEditor.style.visibility = 'hidden'

                let globalEditor = document.getElementById('global');
                if(globalEditor) globalEditor.style.visibility = 'visible'
                this.app.interface.globalEditor.focus();
            } else {
                let globalEditor = document.getElementById('global');
                if(globalEditor) globalEditor.style.visibility = 'hidden'
                this.app.gridMode = 'grid'
            }
            this.isCapturingInput = !this.isCapturingInput;
            event.preventDefault();
        }
    }

    createZoneHandler = (event: KeyboardEvent): void => {
        if ((event.key == 'z' || event.key == "Z") && this.keyPresses['Control']) {
             this.app.getCurrentTable().createActionArea(
                this.app.context.cursor.getX(),
                this.app.context.cursor.getY(),
                this.app.context.cursor.getXSize(),
                this.app.context.cursor.getYSize(),
            );
        }
    }

    keyDownListener = (event: KeyboardEvent): void => {
        this.app.redraw = true;
        this.keyPresses[event.key] = true;
        let keybindings = this.textEditingMode ? this.EditingKeyFunctions : this.NormalKeyFunctions;
        if (this.isCapturingInput) {
          keybindings.forEach(func => {
            window.requestAnimationFrame(() => {
                func(event)
            })
          });
        } else {
          const authorizedFunctions = [
            this.tabKeyHandler, 
            this.shiftTabKeyHandler, 
            this.submitCodeHandler
          ];
          authorizedFunctions.forEach(func => {
            window.requestAnimationFrame(() => {
              func(event);
            });
          });
        }
    }

    keyUpListener = (event: KeyboardEvent):void => {
        this.keyPresses[event.key] = false;
    }

    submitCodeHandler = (event: KeyboardEvent):void => {
        if (event.key == 'Enter' && this.keyPresses['Control']) {
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
        if (event.key == 'c' && (this.keyPresses['Control'] || this.keyPresses['Meta'])) {
            this.app.context.tables[this.app.context.current_table].copyUnderCursor();
        }
    }

    pasteHandler = (event:KeyboardEvent):void => {
        if (event.key == 'v' && (this.keyPresses['Control'] || this.keyPresses['Meta'])) {
            this.app.context.tables[this.app.context.current_table].paste();
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
            this.app.context.tables[this.app.context.current_table].removeCell(
                this.app.context.cursor.getX(), this.app.context.cursor.getY());
                this.app.context.cursor.incrementX();
        }
    }

    enterKeyHandler = (event:KeyboardEvent):void => {
        if (event.key == 'Enter') {
            // cursor.getY() += 1; cursor.getX() -= 1;
            this.app.context.cursor.incrementXY(-1, 1);

        }
    }

    backSpaceHandler = (event:KeyboardEvent):void => {
        if (event.key === "Backspace") {
            if (this.app.context.cursor.getXSize() == 1 && this.app.context.cursor.getYSize() == 1) {
                this.app.context.tables[this.app.context.current_table].removeCell(
                    this.app.context.cursor.getX(), this.app.context.cursor.getY());
                this.app.context.cursor.incrementX(-1);
            } else {
                this.app.context.tables[this.app.context.current_table].removeZone(
                    this.app.context.cursor.getX(), this.app.context.cursor.getY(),
                    this.app.context.cursor.getXSize(), this.app.context.cursor.getYSize()
                )
                this.app.context.cursor.incrementX(-1);
            }
        }
    }

    charInputFilter = (event:KeyboardEvent):boolean => {
        let forbiddenKeys = "§²"
        return forbiddenKeys.includes(event.key)? false : true;
    }

    charInputHandler = (event:KeyboardEvent):void => {
        if (event.key.length == 1 && !(this.keyPresses['Control'] || this.keyPresses['Meta'])) {
             if (event.key.match(/^[\x21-\x7E]$/)) {
                if (this.charInputFilter(event)) {
                    this.app.context.tables[this.app.context.current_table].addCell(
                        this.app.context.cursor.getX(), this.app.context.cursor.getY(), event.key
                    );
                    this.app.interface.appendCell(event.key, this.app.context.cursor.getX(), this.app.context.cursor.getY());
                    this.app.context.cursor.incrementX();
                }
            }
        }
    }

    keyDownHandler = (event:KeyboardEvent):void => {
        if (event.key == 'ArrowDown' && this.keyPresses['Shift']) {
            this.app.context.cursor.incrementY(5);
        } else if (event.key == 'ArrowDown' && this.keyPresses['Control']) {
            this.app.context.cursor.incrementYSize();
        } else if (event.key == 'ArrowDown') {
            this.app.context.cursor.incrementY();
        }
    }
    
    keyUpHandler = (event:KeyboardEvent):void => {
        if (event.key == 'ArrowUp' && this.keyPresses['Shift']) {
            this.app.context.cursor.incrementY(-5);
        } else if (event.key == 'ArrowUp' && this.keyPresses['Control']) {
            if (this.app.context.cursor.getYSize() > 1) {
                this.app.context.cursor.incrementYSize(-1);
            }
        } else if (event.key == 'ArrowUp') {
            this.app.context.cursor.incrementY(-1);
        }
    }

    keyLeftHandler = (event:KeyboardEvent):void => {
        if (event.key == 'ArrowLeft' && this.keyPresses['Shift']) {
            this.app.context.cursor.incrementX(-5);
        } else if (event.key == 'ArrowLeft' && this.keyPresses['Control']) {
            if (this.app.context.cursor.getXSize() > 1) {
                this.app.context.cursor.incerementXSize(-1);
            }
        } else if (event.key == 'ArrowLeft') {
            this.app.context.cursor.incrementX(-1);
        }
    }

    keyRightHandler = (event:KeyboardEvent):void => {
        if (event.key == 'ArrowRight' && this.keyPresses['Shift']) {
            this.app.context.cursor.incrementX(5);
        } else if (event.key == 'ArrowRight' && this.keyPresses['Control']) {
            this.app.context.cursor.incerementXSize();
        } else if (event.key == 'ArrowRight') {
            this.app.context.cursor.incrementX();
        }
    }

    pageUpHandler = (event:KeyboardEvent):void => {
        if (event.key == 'PageUp') {
            // Jump to next universe
            const tables = this.app.context.tables;
            // Find index of current table
            const universeIndex = this.app.getUniverseIndex();
            // Enumerate tables object keys
            const tableKeys = Object.keys(tables);
             // Get next table key, wrap to 0 if at end
            const nextTableKey = tableKeys[universeIndex + 1] ? universeIndex+1 : 0;
            // Get next universe name
            const universeName = tableKeys[nextTableKey];
            // Load next universe
            this.app.interface.loadUniverse(universeName);
        }
    }

    pageDownHandler = (event:KeyboardEvent):void => {
        if (event.key == 'PageDown') {
            // Jump to previous universe
            const tables = this.app.context.tables;
            // Find index of current table
            const universeIndex = this.app.getUniverseIndex();
            // Enumerate tables object keys
            const tableKeys = Object.keys(tables);
            // Get previous table key, wrap to end if at 0
            const previousTableKey = tableKeys[universeIndex - 1] ? universeIndex-1 : tableKeys.length-1;
            // Get previous universe name
            const universeName = tableKeys[previousTableKey];
            // Load previous universe
            this.app.interface.loadUniverse(universeName);
        }
    }

}