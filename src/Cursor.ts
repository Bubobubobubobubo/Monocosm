import type { Application } from "./Application";
import type { CursorData } from "./Types";


export class Cursor {

    private x: number
    private y: number
    private y_size: number
    private x_size: number

    constructor(
        
        public app: Application,
        x: number, 
        y: number,
        x_size: number = 1,
        y_size: number = 1,
    ) { 
        this.y = y;
        this.x = x;
        this.y_size = y_size;
        this.x_size = x_size;
    }

    incrementY = (amount: number = 1) => {
        const old = this.y;
        this.y += amount;
        this.app.interface.moveGrid(undefined, old);
    }

    incrementX = (amount: number = 1) => {
        const old = this.x;
        this.x += amount;
        this.app.interface.moveGrid(old, undefined);
    }

    incrementXY = (x_amount: number = 1, y_amount: number = 1) => {
        const oldX = this.x;
        const oldY = this.y;
        this.x += x_amount;
        this.y += y_amount;
        this.app.interface.moveGrid(oldX, oldY);
    }

    incrementYSize = (amount: number = 1) => {
        this.y_size += amount;
        this.app.interface.setCursorYSize(this.y_size);
        this.app.interface.moveGrid();
    }

    incerementXSize = (amount: number = 1) => {
        this.x_size += amount;
        this.app.interface.setCursorXSize(this.x_size);
        this.app.interface.moveGrid();
    }

    setY = (y: number) => {
        const old = this.y;
        this.y = y;
        this.app.interface.moveGrid(undefined, old);
    }

    setX = (x: number) => {
        const old = this.x;
        this.x = x;
        this.app.interface.moveGrid(old, undefined);
    }

    setXY = (x: number, y: number) => {
        const oldX = this.x;
        const oldY = this.y;
        this.x = x;
        this.y = y;
        this.app.interface.moveGrid(oldX, oldY);
    }

    forceXY = (x: number, y: number) => {
        this.x = x;
        this.y = y;
    }

    setXSize = (x_size: number) => {
        this.x_size = x_size;
        this.app.interface.setCursorXSize(this.x_size);
        this.app.interface.moveGrid();
    }

    setYSize = (y_size: number) => {
        this.y_size = y_size;
        this.app.interface.setCursorYSize(this.y_size);
        this.app.interface.moveGrid();
    }

    setSize = (x_size: number, y_size: number) => {
        this.x_size = x_size;
        this.y_size = y_size;
        this.app.interface.setCursorSize(this.x_size, this.y_size);
        this.app.interface.moveGrid();
    }

    getX = (): number => {
        return this.x;
    }

    getY = (): number => {
        return this.y;
    }

    getXSize = (): number => {
        return this.x_size;
    }

    getYSize = (): number => {
        return this.y_size;
    }
    
    getCursorData = (): CursorData => {
        let data = {
            'x': this.x, 'y': this.y,
            'y_size': this.y_size, 
            'x_size': this.x_size
        };
        return data;
    }

    get size() {
        return { y_size: this.y_size, x_size: this.x_size };
    }

    resetCursorSize = (): void => {
        const old_x_size = this.x_size;
        const old_y_size = this.y_size;
        this.y_size = 1;
        this.x_size = 1;
        this.app.interface.moveGrid(this.x, this.y, old_x_size, old_y_size);
        this.app.interface.setCursorSize(1, 1);
    }

    toString = (): string => {
        return `( ${this.x}, ${this.y} )`;
    }

    isUnder = (x: number, y: number): boolean => {
        // Refactor this to check if it's in the range of the cursor selection
        return y >= this.y && y < this.y + this.y_size && x >= this.x && x < this.x + this.x_size;
    }

    createFromStoredContext = (data: CursorData) => {
        this.x = data.x;
        this.y = data.y;
        this.y_size = data.y_size;
        this.x_size = data.x_size;
    }
}