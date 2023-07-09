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
            this.script = {'text': '', 'dirty': true};
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
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                let id = this.generateID(i, j);
                this.pasteBuffer[id] = this.getCell(x + j, y + i);
            }
        }
    }

}