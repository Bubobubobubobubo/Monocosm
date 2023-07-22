import { Colors, Terminal, Key } from 'wglt';
import { Context, Script } from './Types';
import { editorSetup } from './EditorSetup';
import { EditorView } from 'codemirror';
import type { Application } from './Application';

const KEYS = [
    'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
    'Control', 'Shift', 'Return', 'Backspace', 'Tab',
]


export type TerminalSize = {
  width: number;
  height: number;
}

type Cursor = {
  x: number;
  y: number;
  x_size: number;
  y_size: number;
}


export class TerminalInterface {

    private readonly localEditor: EditorView
    private readonly globalEditor: EditorView
    terminal: Terminal;
    public cursor: Cursor;
    pressedKeys: { [key: string]: boolean }
    private console_height: number
    private console_width: number

    constructor(
        public application: Application, 
        public canvas: HTMLCanvasElement
        ) {
        this.pressedKeys = Object.fromEntries(Object.keys(KEYS).map((key) => [key, false]));
        this.pressedKeys = {
            'ArrowUp': false,
            'ArrowDown': false,
            'ArrowLeft': false,
            'ArrowRight': false,
            'Control': false,
            'Shift': false,
            'Return': false,
            'Backspace': false,
            'Tab': false,
        }
        this.console_height = 80;
        this.console_width = 40;
        this.cursor = { x: 0, y: 0, y_size: 1, x_size: 1 }
        this.terminal = new Terminal(canvas as HTMLCanvasElement, 80, 40, {});
        this.terminal.update = this.updateView
        this.localEditor = new EditorView({
            extensions: [
                editorSetup,
                EditorView.updateListener.of((e) => {
                    this.application.getCurrentTable().script.temporary_code = e.state.doc.toString();
                })
            ],
            parent: undefined
        })

        // TODO: use a different style for the mainScript editor!
        this.globalEditor = new EditorView({
            extensions: [
                editorSetup,
                EditorView.updateListener.of((e) => {
                    this.application.context.mainScript.temporary_code = e.state.doc.toString();
                })
            ],
            parent: undefined
        })
    }



    private drawGrid = () => {
        this.terminal.fillRect(0, 0, this.terminal.width, this.terminal.height, Colors.BLACK, Colors.BLACK);
        this.terminal.clear();
        // Repaint all the bakground black
        this.terminal.drawString(0, 0, 'FPS: ' + this.terminal.fps.toFixed(0), Colors.WHITE, Colors.BLACK);
        this.terminal.drawString(0, 1, 'Avg: ' + this.terminal.averageFps.toFixed(0), Colors.WHITE, Colors.BLACK);
        this.terminal.fontSize = 48;

        for (let x = this.cursor.x ; x < this.cursor.x + this.terminal.width; x++) {
            for (let y = this.cursor.y ; y < this.cursor.y + this.terminal.height; y++) {
                let content = this.application.getCurrentTable().getCell(x, y);
                if (content) {
                    this.terminal.drawString(x - this.cursor.x, y - this.cursor.y, 
                        content, Colors.WHITE, Colors.BLACK);
                } else {
                    this.terminal.drawString(x - this.cursor.x, y - this.cursor.y, 
                        " ", Colors.WHITE, Colors.BLACK);
                }
           }
        }

        // Draw the cursor right in the middle of the screen
        // Note that the cursor is not really where the coordinates 
        // point on the screen
        let middle_width = Math.floor(this.terminal.width / 2) - 4;
        let middle_height = Math.floor(this.terminal.height / 2);
        for (let x = 0; x < this.cursor.x_size; x++) {
            for (let y = 0 ; y < this.cursor.y_size ; y++) {
                this.terminal.drawString(
                    middle_width + x, middle_height + y, 
                    this.application.getCurrentTable().getCell(
                        middle_width + x + this.cursor.x, middle_height + y + this.cursor.y) || 
                        " ", Colors.WHITE, Colors.DARK_RED
                ); 
            }
        }

    }

    private updateView = () => {
        this.terminal.clear();
        this.drawGrid();

        if (this.terminal.isKeyPressed('ArrowLeft')) {
            if (this.terminal.isKeyDown('ControlLeft')) {
                this.cursor.x -= 5;
            } else if (this.terminal.isKeyDown('ShiftLeft')) {
                this.cursor.x_size -= this.cursor.x_size - 1 < 1 ? 0 : 1;
            } else {
                this.cursor.x -= 1;
            }
        }

        if (this.terminal.isKeyPressed('ArrowRight')) {
            if (this.terminal.isKeyDown('ControlLeft')) {
                this.cursor.x += 5;
            } else if (this.terminal.isKeyDown('ShiftLeft')) {
                this.cursor.x_size += this.cursor.x_size + 1 > this.terminal.width ? 0 : 1;
            } else {
                this.cursor.x += 1;
            }
        }

        if (this.terminal.isKeyPressed('ArrowUp')) {
            if (this.terminal.isKeyDown('ControlLeft')) {
                this.cursor.y -= 5;
            } else if (this.terminal.isKeyDown('ShiftLeft')) {
                this.cursor.y_size -= this.cursor.y_size - 1 < 1 ? 0 : 1;
            } else {
                this.cursor.y -= 1;
            }
        }

        if (this.terminal.isKeyPressed('Escape')) {
            this.cursor.x_size = 1;
            this.cursor.y_size = 1;
        }

        if (this.terminal.isKeyPressed('ArrowDown')) {
            if (this.terminal.isKeyDown('ControlLeft')) {
                this.cursor.y += 5;
            } else if (this.terminal.isKeyDown('ShiftLeft')) {
                this.cursor.y_size += this.cursor.y_size + 1 > this.terminal.height ? 0 : 1;
            } else {
                this.cursor.y += 1;
            }
        }



       this.terminal.drawString(this.terminal.height - 1, this.terminal.width - 1, "@", Colors.WHITE);
       let position = `X: ${this.cursor.x} Y: ${this.cursor.y}`;
       let cursor_size = `XS: ${this.cursor.x_size} YS: ${this.cursor.y_size}`;
       this.terminal.drawString(this.terminal.width - 10 - position.length,  this.terminal.height - 2, position, Colors.WHITE);  
       // Print the cursor size just before the position
       this.terminal.drawString(this.terminal.width - 8 - cursor_size.length,  this.terminal.height - 3, cursor_size, Colors.WHITE);
    }


    howManyCharactersFitWidth = ():number => {
        return Math.floor(this.canvas.width / this.terminal.fontsize);
    }

    howManyCharactersFitHeight = (): number => {
        return Math.floor(this.canvas.height / this.terminal.fontsize);
    }

    private createCell = (char: string, x: number, y: number, color: Colors): void => {
        this.terminal.drawString(x, y, char, color);
    }

    loadScript = (script: Script, editor: string = 'local') => {
        const selectedEditor = editor == 'local' ? this.localEditor : this.globalEditor;
        selectedEditor.dispatch({
            changes: {
                from: 0,
                to: selectedEditor.state.doc.length,
                insert: script.committed_code
            }
        })
    }

}