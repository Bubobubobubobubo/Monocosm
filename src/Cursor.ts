import type { Application } from "./Application";

export class Cursor {
    constructor(
        public app: Application,
        public x: number, 
        public y: number, 
        public y_size: number = 1,  
        public x_size: number = 1
    ) { 
        this.y = y;
        this.x = x;
        this.y_size = y_size;
        this.x_size = x_size;
    }

    resetCursorSize = (): void => {
        this.y_size = 1;
        this.x_size = 1;
    }

    incrementY = (amount: number) => this.y_size += amount;
    incrementX = (amount: number) => this.x_size += amount;

    toString = (): string => {
        return `Cursor: ${this.x}, ${this.y}`;
    }

    isUnder = (y: number, x: number): boolean => {
        return y == this.y && x == this.x;
    }

}