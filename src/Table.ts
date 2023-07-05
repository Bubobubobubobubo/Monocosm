import type { Application } from "./Application";

interface PasteBuffer { [key: string]: string }
interface Cells { [key: string]: string }

export class Table {

    cells: Cells
    script: string
    theme: string
    pasteBuffer: PasteBuffer

    constructor(public app: Application, data?: object) {
        if (data !== undefined) {
            this.cells = data['cells'];
            this.script = data['script'];
            this.theme = data['theme'];
        } else {
            this.cells = {};
            this.script = '';
            this.theme = 'dark';
        }
        this.pasteBuffer = {};
    }

    resetPasteBuffer = () => this.pasteBuffer = {}

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

    paste = () => {
        let { y, x } = this.app.context.cursor;
        let { y_size , x_size } = this.app.context.cursor.size;
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                let id = this.generateID(i, j);
                if (this.pasteBuffer.hasOwnProperty(id)) {
                    this.addCell(x + i, y + j, this.pasteBuffer[id]);
                }
            }
        }
    }

    removeZone = (y: number, x: number, y_size: number, x_size: number) => {
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                this.removeCell(y + i, x + j);
            }
        }
    }

    copyUnderCursor = () => {
        let { x, y } = this.app.context.cursor;
        let { y_size , x_size } = this.app.context.cursor.size;
        this.resetPasteBuffer();
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                let id = this.generateID(i, j);
                this.pasteBuffer[id] = this.getCell(x + i, y + j);
            }
        }
    }

}