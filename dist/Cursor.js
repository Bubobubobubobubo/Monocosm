export class Cursor {
    constructor(app, x, y, y_size = 1, x_size = 1) {
        this.app = app;
        this.x = x;
        this.y = y;
        this.y_size = y_size;
        this.x_size = x_size;
        this.resetCursorSize = () => {
            this.y_size = 1;
            this.x_size = 1;
        };
        this.incrementY = (amount) => this.y_size += amount;
        this.incrementX = (amount) => this.x_size += amount;
        this.toString = () => {
            return `Cursor: ${this.x}, ${this.y}`;
        };
        this.y = y;
        this.x = x;
        this.y_size = y_size;
        this.x_size = x_size;
    }
}
