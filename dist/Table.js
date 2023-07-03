export class Table {
    constructor(app) {
        this.app = app;
        this.addCell = (y, x, char) => {
            let id = this.generateID(y, x);
            this.cells[id] = char;
        };
        this.clear = () => this.cells = {};
        this.generateID = (y, x) => `${y},${x}`;
        this.exists = (id) => this.cells.hasOwnProperty(id);
        this.existsAt = (y, x) => this.exists(this.generateID(y, x));
        this.getCell = (y, x) => {
            let id = this.generateID(y, x);
            if (!this.exists(id)) {
                this.addCell(y, x, '');
                return this.cells[id];
            }
            else {
                return this.cells[id];
            }
        };
        this.cells = {};
    }
}
