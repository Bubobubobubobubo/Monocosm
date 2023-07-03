import { Camera } from './Camera.js';
import { Cursor } from './Cursor.js';
import { Table } from './Table.js';
import { InputHandler } from './InputHandler.js';

export type OutputType = 'text' | 'canvas';
interface Context {
    camera: Camera;
    cursor: Cursor;
    tables: object,
    current_table: string
};

export interface VisibleZone {
    from_x: number; to_x: number;
    from_y: number; to_y: number;
}

export class Application {

    context: Context;
    input: InputHandler;
    redraw: boolean;
    last_grid: string;

    constructor(public output_type: OutputType) {
        this.context = {
            'camera': new Camera(this, this.howManyCharactersFitHeight(), this.howManyCharactersFitWidth()),
            'cursor': new Cursor(this, 0, 0, 1, 1),
            'tables': {
                'default': new Table(this),
            },
            'current_table': 'default',
        }
        this.input = new InputHandler(this);
        this.redraw = true;

        // Adding random stuff to the grid for testing
        for (let i=0; i < 50; i++) {
            // Add random cells on table
            let random_x = Math.floor(Math.random() * 50);
            let random_y = Math.floor(Math.random() * 50);
            let random_letter = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
            this.context.tables[this.context.current_table].addCell(random_x, random_y, random_letter);
        }
    }

    howManyCharactersFitWidth = (): number => {
        const testElement = document.createElement('span');
        testElement.innerText = 'X';
        testElement.className = 'cell';
        testElement.style.visibility = 'hidden';
        testElement.style.position = 'absolute';
        document.body.appendChild(testElement);
        const characterWidth = testElement.offsetWidth;
        const viewportWidth = window.innerWidth;
        document.body.removeChild(testElement);
        return Math.floor(viewportWidth / characterWidth);
    }
    
    howManyCharactersFitHeight = (): number => {
        const testElement = document.createElement('span');
        testElement.innerText = 'X';
        testElement.className = 'cell';
        testElement.style.visibility = 'hidden';
        testElement.style.position = 'absolute';
        document.body.appendChild(testElement);
        const characterHeight = testElement.offsetHeight;
        const viewportHeight = window.innerHeight;
        document.body.removeChild(testElement);
        return Math.floor(viewportHeight / characterHeight);
    }

    process = (): string => {
        if (this.output_type == 'text') {
            return this.processText(this.context);
        } else {
            Error('Output type not supported');
        }
    }

    processText = (context: Context): string => {
        return this.drawGrid(context);
    }

    resizeGrid = (): void => {
        this.context.camera.resize(this.howManyCharactersFitHeight(), this.howManyCharactersFitWidth());
        this.redraw = true;
    }

    drawGrid = (context: Context): string => {
        if (!this.redraw) { return this.last_grid; }
        let visible_zone = context.camera.getVisibleZone();
        let grid = [];
        for (let y = visible_zone.from_y; y < visible_zone.to_y; y++) {
            for (let x = visible_zone.from_x; x < visible_zone.to_x; x++) {
                if(this.context.tables[this.context.current_table].existsAt(x,y)) {
                    grid.push(this.drawCharacter(this.context.tables[this.context.current_table]
                        .getCell(x,y), 'white', 'black'));
                } else if(this.context.cursor.isUnder(y,x)) {
                    grid.push(this.drawCursor('white', 'black'));
                } 
                else {
                    grid.push(this.drawCharacter('.', 'grey', 'black'));
                }
            }
            grid.push('<br>');
        }
        this.last_grid = grid.join("");
        this.redraw = false;
        return this.last_grid;
    }

    drawCharacter = (char: string, color: string, background: string) => {
        return `<span class="cell" style="color:${color};background:${background}">${char}</span>`
    }

    drawCursor = (color: string, background: string): string => {
        return `<span class="cell" style="color:${color};background:${background}">█</span>`
    }

    getVisibleZone = (context: Context): VisibleZone => {
        let x = context.cursor.x; let y = context.cursor.y;
        return {
            'from_x': x - Math.floor(context.camera.x / 2),
            'to_x': x + Math.floor(context.camera.x / 2),
            'from_y': y - Math.floor(context.camera.y / 2),
            'to_y': y + Math.floor(context.camera.y / 2),
        }
    }
}