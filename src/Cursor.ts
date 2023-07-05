import type { Application } from "./Application";

export interface CursorData {
    x: number
    y: number
    y_size: number
    x_size: number
}

export class Cursor {

    x: number
    y: number
    y_size: number
    x_size: number

    constructor(
        public app: Application,
        x: number, 
        y: number, 
        y_size: number = 1,  
        x_size: number = 1
    ) { 
        this.y = y;
        this.x = x;
        this.y_size = y_size;
        this.x_size = x_size;
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

    incrementY = (amount: number) => this.y_size += amount;
    incrementX = (amount: number) => this.x_size += amount;

    toString = (): string => {
        return `Cursor: ${this.x}, ${this.y} | Size: ${this.x_size}, ${this.y_size}`;
    }

    isUnder = (y: number, x: number): boolean => {
        // Refactor this to check if it's in the range of the cursor selection
        return y >= this.y && y < this.y + this.y_size && x >= this.x && x < this.x + this.x_size;
    }

    loadFromLocalStorage = (data: CursorData) => {
        this.x = data.x;
        this.y = data.y;
        this.y_size = data.y_size;
        this.x_size = data.x_size;
    }
}