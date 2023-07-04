import { Camera } from './Camera.js';
import { Cursor, CursorData } from './Cursor.js';
import { Table } from './Table.js';
import { InputHandler } from './InputHandler.js';
import { TextInterface } from './TextInterface.js';
import { Command } from './Command.js';

// Possible frontend output types
export type OutputType = 'text' | 'canvas';

// Context is application state
export interface Context {
    camera: Camera;
    cursor: Cursor;
    tables: object,
    current_table: string
};

// Content saved to localstorage
export interface SavedContext {
    cursor: CursorData;
    tables: object;
    current_table: string;
}

// Visible zone is the part of the grid that is visible to the user
export interface VisibleZone {
    from_x: number; to_x: number;
    from_y: number; to_y: number;
}

export class Application {

    command: Command;
    context: Context;
    input: InputHandler;
    redraw: boolean;
    last_grid: string;
    interface: TextInterface | null;

    constructor(public output_type: OutputType) {
        this.input = new InputHandler(this);
        this.command = new Command(this);
        this.redraw = true;
        this.interface = null;
        this.init()
    }

    init = () => {
        if (this.output_type == 'text') {
            this.interface = new TextInterface(this);
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

            // Resume from localStorage data
            if (localStorage.getItem('context') !== null) {
                // Reset the cursor back to its position
                let saved_context: SavedContext = JSON.parse(localStorage.getItem('context'));
                this.context.cursor.loadFromLocalStorage(saved_context.cursor);
                // Load the tables back from localStorage
                for (const [key, value] of Object.entries(saved_context.tables)) {
                    this.context.tables[key] = new Table(this, value);
                }
                // Switch to the table that was active
                this.context.current_table = saved_context.current_table;
            }
        } else {
            Error('Output type not supported');
        }
    }

    process = (): string => {
        return this.interface.drawGrid(this.context);
    }

    // Preparing SavedContext for localstorage
    save = (): SavedContext => {
        let tables_state = {}
        for (const [key, value] of Object.entries(this.context.tables)) {
            tables_state[key] = value.data;
        };
        let cursor_state = this.context.cursor.getCursorData();
        let current_table = this.context.current_table;
        console.log(cursor_state)
        return {
            'tables': tables_state,
            'cursor': cursor_state,
            'current_table': current_table,
        }
    }
}