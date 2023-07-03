import type { Application } from "./Application";

export class Table {
    cells: object
    constructor(public app: Application) {
        this.cells = {}
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
}