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

    dezoom = () => {
        this.terminal = new Terminal(this.canvas as HTMLCanvasElement, 
            this.console_width -=5, 
            this.console_height -=2, {}
        );
    }

    zoom = () => {
        this.terminal = new Terminal(this.canvas as HTMLCanvasElement, 
            this.console_width +=5, 
            this.console_height +=2, {});
    }

    private drawGrid = () => {
        // Loop for the content of the grid

        this.terminal.clear();
        for (let x = this.cursor.x ; x < this.cursor.x + this.terminal.width; x++) {
            for (let y = this.cursor.y ; y < this.cursor.y + this.terminal.height; y++) {
                let content = this.application.getCurrentTable().getCell(x, y);
                this.terminal.drawString(x - this.cursor.x, y - this.cursor.y, 
                    content, Colors.WHITE);
            }
        }
    }

    private updateView = () => {
        this.terminal.clear();
        this.drawGrid();

       if (this.terminal.isKeyPressed('Enter') && this.terminal.isKeyDown('ShiftLeft')) {
            this.dezoom();
        }

        if (this.terminal.isKeyPressed('ArrowLeft')) {
            if (this.terminal.isKeyDown('ShiftLeft')) {
                this.cursor.x -= 5;
            } else {
                this.cursor.x -= 1;
            }
        }

        if (this.terminal.isKeyPressed('ArrowRight')) {
            if (this.terminal.isKeyDown('ShiftLeft')) {
                this.cursor.x += 5;
            } else {
                this.cursor.x += 1;
            }
        }

        if (this.terminal.isKeyPressed('ArrowUp')) {
            if (this.terminal.isKeyDown('ShiftLeft')) {
                this.cursor.y -= 5;
            } else {
                this.cursor.y -= 1;
            }
        }

        if (this.terminal.isKeyPressed('ArrowDown')) {
            if (this.terminal.isKeyDown('ShiftLeft')) {
                this.cursor.y += 5;
            } else {
                this.cursor.y += 1;
            }
        }



       this.terminal.drawString(this.terminal.height - 1, this.terminal.width - 1, "@", Colors.WHITE);
       let position = `X: ${this.cursor.x} Y: ${this.cursor.y}`;
       this.terminal.drawString(this.terminal.width - 10 - position.length,  this.terminal.height - 2, position, Colors.WHITE);  
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