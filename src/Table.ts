import type { Application } from "./Application";
import type { Script, TableData, PasteBuffer, Cells } from "./Types";


export class Table {

    cells: Cells
    script: Script
    theme: string
    pasteBuffer: PasteBuffer
    variables: object
    walkers: object

    constructor(public app: Application, data?: TableData) {
        if (data !== undefined) {
            this.variables = data['variables'];
            this.cells = data['cells'];
            this.script = data['script'];
            this.theme = data['theme'];
            this.walkers = {};
        } else {
            this.cells = {};
            this.walkers = {};
            this.script = {'committed_code': '', 'temporary_code': ''}
            this.theme = 'dark';
            this.variables = {};
        }
        this.pasteBuffer = {};
    }

    resetPasteBuffer = () => this.pasteBuffer = {}

    public get data():object {
        return {
            'cells': this.cells,
            'paste_buffer': this.pasteBuffer,
            'script': this.script,
            'theme': this.theme
        }
    }

    addCell = (x: number, y: number, char: string) => {
        let id = this.generateID(x, y)
        this.cells[id] = char;
    }

    clear = () => this.cells = {}

    generateID = (x: number, y: number) => `${x},${y}`

    exists = (id: string) => this.cells.hasOwnProperty(id)

    existsAt = (x: number, y: number) => this.exists(this.generateID(x, y))

    getCell = (x: number, y: number) => {
        let id = this.generateID(x, y);
        if (!this.exists(id)) {
            return '';
        } else {
            return this.cells[id];
        }
    }

    removeCell = (x: number, y: number) => {
        let id = this.generateID(x, y);
        if (this.exists(id)) {
            delete this.cells[id];
        }
    }

    paste = () => {
        let { x, y } = this.app.context.cursor;
        let { x_size , y_size } = this.app.context.cursor.size;
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                let id = this.generateID(i, j);
                if (this.pasteBuffer.hasOwnProperty(id) && this.pasteBuffer[id] !== '') {
                    this.addCell(x + j, y + i, this.pasteBuffer[id]);
                }
            }
        }
    }

    pasteFromBeyond = async () => {
        // Get cursor element with id 'cursor'
        let editable = document.getElementById('cursor-cell');
        // Set contenteditable to true
        editable?.setAttribute('contenteditable', 'true');
        document.body.appendChild(editable as HTMLElement);
        editable?.focus();
        // Wait for user to paste into cursor and get event
        let promtValue = await new Promise((resolve) => {
            editable?.addEventListener('paste', (e) => {
                e.preventDefault();
                // Return pasted value
                resolve(e.clipboardData?.getData('text/plain'));
            });
            // If any other event then paste or Ctrl+V, return empty string
            editable?.addEventListener('keydown', (e) => {
                if (!e.ctrlKey) {
                    resolve('');
                }
            });
        });

        // Remove editable from DOM
        document.body.removeChild(editable as HTMLElement);

        let pasteString = promtValue as string;

        // If pasteString is empty, return
        if (pasteString === '') return;

        this.resetPasteBuffer();
        // Split string into lines
        let lines = pasteString.split('\n');
        // Get largest line length
        let x_size = Math.max(...lines.map(line => line.length));
        let y_size = lines.length;
        // Set cursor size to the size of the paste
        this.app.context.cursor.setSize(x_size, y_size);
        this.resetPasteBuffer();
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                // If lines[i][j] is undefined, empty string or space, don't add to paste buffer
                if(lines[i][j]) {
                    if (lines[i][j] !== undefined || lines[i][j] !== '' || lines[i][j] !== ' ') {
                        let id = this.generateID(i, j);
                        this.pasteBuffer[id] = lines[i][j];
                    }
                }
            }
        }
        this.paste();
    }

    removeZone = (x: number, y: number, x_size: number, y_size: number) => {
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                this.removeCell(x + i, y + j);
            }
        }
    }

    copyUnderCursor = () => {
        let { x, y } = this.app.context.cursor;
        let { x_size , y_size } = this.app.context.cursor.size;
        this.resetPasteBuffer();
        let string = '';
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                let id = this.generateID(i, j);
                this.pasteBuffer[id] = this.getCell(x + j, y + i);
                string += this.pasteBuffer[id]=='' ? ' ' : this.pasteBuffer[id];
            }
            string += '\n';
        }
        this.pasteToClipboard(string);
    }

    pasteBufferToString = () => {
        let string = '';
        for(let key in this.pasteBuffer) {
            string += this.pasteBuffer[key]=='' ? ' ' : this.pasteBuffer[key];
        }
        return string;
    }

    pasteToClipboard = (pasteString: string) => {
        navigator.clipboard.writeText(pasteString);
    }

}