import { Camera } from './Camera.js';
import { Cursor } from './Cursor.js';
import { Table } from './Table.js';
import { InputHandler } from './InputHandler.js';
;
export class Application {
    constructor(output_type) {
        this.output_type = output_type;
        this.process = () => {
            if (this.output_type == 'text') {
                return this.processText(this.context);
            }
            else {
                Error('Output type not supported');
            }
        };
        this.processText = (context) => {
            return this.drawGrid(context);
        };
        this.drawGrid = (context) => {
            let visible_zone = this.getVisibleZone(context);
            let grid = [];
            for (let y = visible_zone.from_y; y < visible_zone.to_y; y++) {
                for (let x = visible_zone.from_x; x < visible_zone.to_x; x++) {
                }
            }
            grid = grid.join("");
            console.log(grid);
            return grid.join("");
        };
        this.addNewlines = (input, chunkSize) => {
            const regex = new RegExp(`(.{${chunkSize}})`, "g");
            return input.replace(regex, "$1\n");
        };
        this.drawCharacter = (char, color, background) => {
            return `<pre style="color:${color};background:${background}">${char}</pre>`;
        };
        this.getVisibleZone = (context) => {
            let x = context.cursor.x;
            let y = context.cursor.y;
            return {
                'from_x': x - context.camera.x / 2,
                'to_x': x + context.camera.x / 2,
                'from_y': y - context.camera.y / 2,
                'to_y': y + context.camera.y / 2,
            };
        };
        this.context = {
            'camera': new Camera(this, 50, 50),
            'cursor': new Cursor(this, 0, 0, 1, 1),
            'tables': {
                'default': new Table(this),
            },
            'current_table': 'default',
        };
        this.input = new InputHandler(this);
        // Adding random stuff to the grid for testing
        for (let i = 0; i < 50; i++) {
            // Add random cells on table
            let random_x = Math.floor(Math.random() * 50);
            let random_y = Math.floor(Math.random() * 50);
            let random_letter = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
            this.context.tables[this.context.current_table].addCell(random_x, random_y, random_letter);
        }
    }
}
