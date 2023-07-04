import type { Application } from "./Application";

export class Table {

    cells: object
    script: string
    pasteBuffer: object

    constructor(public app: Application, data?: object) {
        if (data !== undefined) {
            this.cells = data['cells'];
            this.script = data['script'];
        } else {
            this.cells = {};
            this.script = '';
        }
        this.pasteBuffer = {};
    }

    public get data():object {
        return {
            'cells': this.cells,
            'paste_buffer': this.pasteBuffer,
            'script': this.script
        }
    }

    addCell = (y: number, x: number, char: string) => {
        let id = this.generateID(y, x)
        this.cells[id] = char;
    }

    clear = () => this.cells = {}

    generateID = (y: number, x: number) => `${y},${x}`

    exists = (id: string) => this.cells.hasOwnProperty(id)

    existsAt = (y: number, x: number) => this.exists(this.generateID(y, x))

    getCell = (y: number, x: number) => {
        let id = this.generateID(y, x);
        if (!this.exists(id)) {
            this.addCell(y, x, '');
            return this.cells[id];
        } else {
            return this.cells[id];
        }
    }

    removeCell = (y: number, x: number) => {
        let id = this.generateID(y, x);
        if (this.exists(id)) {
            delete this.cells[id];
        }
    }

    copy = () => {
        let { y, x } = this.app.context.cursor;
        let { height, width } = this.app.context.cursor.size;
        this.pasteBuffer = {};
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let cell = this.getCell(y + i, x + j);
                if (cell) {
                    this.pasteBuffer[this.generateID(i, j)] = cell;
                }
            }
        }
    }

    paste = () => {
        let { y, x } = this.app.context.cursor;
        let { height, width } = this.app.context.cursor.size;
        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let id = this.generateID(i, j);
                if (this.pasteBuffer.hasOwnProperty(id)) {
                    this.addCell(y + i, x + j, this.pasteBuffer[id]);
                }
            }
        }
    }
}