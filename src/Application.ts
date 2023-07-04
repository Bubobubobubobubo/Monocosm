import { Camera } from './Camera.js';
import { Cursor } from './Cursor.js';
import { Table } from './Table.js';
import { InputHandler } from './InputHandler.js';
import { TextInterface } from './TextInterface.js';

export type OutputType = 'text' | 'canvas';
export interface Context {
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
    interface: TextInterface | null;

    constructor(public output_type: OutputType) {
        this.input = new InputHandler(this);
        this.redraw = true;
        this.interface = null;
        this.init()

        // Adding random stuff to the grid for testing
        // for (let i=0; i < 50; i++) {
        //     // Add random cells on table
        //     let random_x = Math.floor(Math.random() * 50);
        //     let random_y = Math.floor(Math.random() * 50);
        //     let random_letter = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
        //     this.context.tables[this.context.current_table].addCell(random_x, random_y, random_letter);
        // }
    }

    init = () => {
        if (this.output_type == 'text') {
            this.interface = new TextInterface(this);
            // Retrieve context from localstorage if possible, else create a new one
            if (localStorage.getItem('context')) {
                console.log('Found context in localstorage')
                let encoded_context = localStorage.getItem('context');
                let context = JSON.parse(atob(encoded_context));
                this.context = context;
            } else {
                console.log('No context found in localstorage, creating a new one')
                this.context = {
                    'camera': new Camera(this, 
                        this.interface.howManyCharactersFitHeight(), 
                        this.interface.howManyCharactersFitWidth()
                    ),
                    'cursor': new Cursor(this, 0, 0, 1, 1),
                    'tables': {
                        'default': new Table(this),
                    },
                    'current_table': 'default',
                }
            }
        } else {
            Error('Output type not supported');
        }
    }

    process = (): string => {
        return this.interface.drawGrid(this.context);
    }

    save = (): void => {
        let context = JSON.stringify(this.context);
        let encoded_context = btoa(context);
        localStorage.setItem('context', encoded_context);
    }
}