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
        this.y += amount;
        this.app.interface.moveGrid();
    }

    incrementX = (amount: number = 1) => {
        this.x += amount;
        this.app.interface.moveGrid();
    }

    incrementXY = (x_amount: number = 1, y_amount: number = 1) => {
        this.x += x_amount;
        this.y += y_amount;
        this.app.interface.moveGrid();
    }

    incrementYSize = (amount: number = 1) => {
        this.y_size += amount;
        this.app.interface.moveGrid();
    }

    incerementXSize = (amount: number = 1) => {
        this.x_size += amount;
        this.app.interface.moveGrid();
    }

    setY = (y: number) => {
        this.y = y;
        this.app.interface.moveGrid();
    }

    setX = (x: number) => {
        this.x = x;
        this.app.interface.moveGrid();
    }

    setXY = (x: number, y: number) => {
        this.x = x;
        this.y = y;
        this.app.interface.moveGrid();
    }

    setXSize = (x_size: number) => {
        this.x_size = x_size;
        this.app.interface.moveGrid();
    }

    setYSize = (y_size: number) => {
        this.y_size = y_size;
        this.app.interface.moveGrid();
    }

    setSize = (x_size: number, y_size: number) => {
        this.x_size = x_size;
        this.y_size = y_size;
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
        this.y_size = 1;
        this.x_size = 1;
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