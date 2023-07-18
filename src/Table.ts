import type { Application } from "./Application";
import type { Script, TableData, PasteBuffer, Cells, ActionAreas } from "./Types";
import { ActionArea } from "./Crawler";


export class Table {
    cells: Cells
    script: Script
    theme: string
    pasteBuffer: PasteBuffer
    variables: object
    actionAreas: ActionAreas

    constructor(public app: Application, data?: TableData) {
        if (data !== undefined) {
            this.variables = data['variables'];
            this.cells = data['cells'];
            this.script = data['script'];
            this.theme = data['theme'];
            this.actionAreas = data['actionAreas'] || {};
        } else {
            this.cells = {};
            this.actionAreas = {};
            this.script = {'committed_code': '', 'temporary_code': '', evaluations: 0};
            this.theme = 'dark';
            this.variables = {};
        }
        this.pasteBuffer = {};
    }

    createActionArea = (x: number, y: number, x_size: number, y_size: number) => {

        const _generateId = () => {
            let how_many = Object.keys(this.actionAreas).length;
            return `${how_many}`;
        }

        // Check if action_ares already exists at this location
        if (!this.actionAreas.hasOwnProperty(_generateId())) {
            let area = new ActionArea(this, x, y, x_size, y_size);
            this.actionAreas[_generateId()] = area;
            this.app.interface.createActionArea(area);
         }

    }

    resetPasteBuffer = () => this.pasteBuffer = {}

    public get data():object {
        return {
            'cells': this.cells,
            'paste_buffer': this.pasteBuffer,
            'script': this.script,
            'theme': this.theme,
            'actionAreas': this.actionAreas
        }
    }

    addCell = (x: number, y: number, char: string): string => {
        let id = this.generateID(x, y)
        this.cells[id] = char;
        return id;
    }

    clear = () => this.cells = {}

    generateID = (x: number, y: number) => `${x},${y}`

    idToCoordinates = (id: string) => {
        let [x, y] = id.split(',');
        return { x: parseInt(x), y: parseInt(y) };
    }

    exists = (id: string) => this.cells.hasOwnProperty(id)

    existsAt = (x: number, y: number) => this.exists(this.generateID(x, y))

    actionAreaAt = (x: number, y: number): boolean => {
        // Iterate over all action areas to check if one exists at this location
        for (let key in this.actionAreas) {
            let area = this.actionAreas[key];
            if (this.coordinateInZone(x, y, area.x, area.y, area.x_size, area.y_size)) {
                return true;
            }
        }
        return false;
    }

    nameOfAreaAt = (x: number, y: number): string => {
        for (let key in this.actionAreas) {
            let area = this.actionAreas[key];
            if (this.coordinateInZone(x, y, area.x, area.y, area.x_size, area.y_size)) {
                return key;
            }
        }
        return "None"
    }


    coordinateInZone = (x1: number, y1: number, x2: number, y2: number, x2_size: number, y2_size: number): boolean => {
        return (x1 >= x2 && x1 < x2 + x2_size && y1 >= y2 && y1 < y2 + y2_size);
    }

    getCell = (x: number, y: number) => {
        let id = this.generateID(x, y);
        if (!this.exists(id)) {
            return '';
        } else {
            return this.cells[id];
        }
    }

    getCellWithId = (id: string) => {
        if(!this.cells[id]) {
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
        this.app.interface.removeCellFromGrid(id);
    }

    paste = () => {
        // Update pasteBuffer
        this.pasteBuffer = this.pasteBufferFromClipboard();
        let x = this.app.context.cursor.getX();
        let y = this.app.context.cursor.getY();
        let x_size = this.app.context.cursor.getXSize();
        let y_size = this.app.context.cursor.getYSize();

        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                let id = this.generateID(i, j);
                if (this.pasteBuffer.hasOwnProperty(id) && this.pasteBuffer[id] !== '') {
                    const px = x + j
                    const py = y + i
                    this.addCell(px, py, this.pasteBuffer[id]);
                    this.app.interface.appendCell(this.pasteBuffer[id], px, py, "inverted-cell");
                }
            }
        }
    }

    pasteBufferFromClipboard = (): PasteBuffer => {
        // Get paste string from interface
        let pasteString = this.app.interface?.pasteFromClipboard;

        // If pasteString is empty, return original paste buffer
        if (pasteString === undefined || pasteString === '')  
        { 
            return this.pasteBuffer;
        }
        else {
            pasteString = this.app.interface?.pasteFromClipboard;
        }

        // Create new buffer
        let pasteBuffer = {};

        // Split string into lines
        pasteString = pasteString as string;
        let lines = pasteString?.split('\n');
        // Get largest line length
        let x_size = Math.max(...lines.map(line => line.length));
        let y_size = lines.length;
        // Set cursor size to the size of the paste
        this.app.context.cursor.setSize(x_size, y_size);
        this.resetPasteBuffer();
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                // If lines[i][j] is undefined, empty string or space, don't add to paste buffer
                if(lines[i][j]) {
                    if (lines[i][j] !== undefined && lines[i][j] !== '' && lines[i][j] !== ' ') {
                        let id = this.generateID(i, j);
                        pasteBuffer[id] = lines[i][j];
                    }
                }
            }
        }
        return pasteBuffer;
    }

    removeZone = (x: number, y: number, x_size: number, y_size: number) => {
        for (let i = 0; i < x_size ; i++) {
            for (let j = 0; j < y_size ; j++) {
                this.removeCell(x + i, y + j);
            }
        }
    }

    copyUnderCursor = () => {
        let x = this.app.context.cursor.getX();
        let y = this.app.context.cursor.getY();
        let x_size = this.app.context.cursor.getXSize();
        let y_size = this.app.context.cursor.getYSize();
        let string = '';
        for (let i = 0; i < y_size ; i++) {
            for (let j = 0; j < x_size ; j++) {
                let cellString = this.getCell(x + j, y + i);
                string += cellString=='' ? ' ' : cellString;
            }

            if (i < y_size - 1) string += '\n';
        }
        this.pasteToClipboard(string);
    }

    pasteBufferToString = () => {
        let string = '';
        for(let key in this.pasteBuffer) {
            string += this.pasteBuffer[key]=='' ? ' ' : this.pasteBuffer[key];
        }
        return string;
    }

    pasteToClipboard = (pasteString: string) => {
        navigator.clipboard.writeText(pasteString);
        this.app.interface?.setPasteFromBrowser(pasteString);
    }

}