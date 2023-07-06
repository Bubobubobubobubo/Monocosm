import { Clock } from './Clock.js';
import { Camera } from './Camera.js';
import { Cursor, CursorData } from './Cursor.js';
import { Table } from './Table.js';
import { InputHandler } from './InputHandler.js';
import { TextInterface } from './TextInterface.js';
import { Command } from './Command.js';
import { MidiOut } from './IO/Midi.js';

export type OutputType = 'text' | 'canvas';
interface Tables { [key: string]: Table }

export interface Context {
    camera: Camera;
    cursor: Cursor;
    tables: Tables;
    current_table: string;
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

    audio_context: AudioContext;
    clock: Clock
    command: Command;
    midi: MidiOut;
    context!: Context;
    input: InputHandler;
    redraw: boolean;
    last_grid: string;
    interface: TextInterface | null;
    running: boolean = false


    constructor(public output_type: OutputType) {
        this.audio_context = new AudioContext();
        this.clock = new Clock(this.audio_context);
        this.midi = new MidiOut();
        this.last_grid = '';
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

            // Resume from ?context parameter
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('context')) {
                // Try to parse the hash using parseHash
                const url_context = this.parseHash(urlParams.get('context') as string);
                this.loadFromSavedContext(url_context);
            } else if (localStorage.getItem('context') !== null) {
                // Resume from localStorage data
                const saved_context: SavedContext = JSON.parse(
                    localStorage.getItem('context') as string
                );
                this.loadFromSavedContext(saved_context);
            }
        } else {
            throw new Error('Output type not supported');
        }
    }

    loadFromSavedContext = (saved_context: SavedContext) => {
        this.context.cursor.createFromStoredContext(saved_context.cursor);

        // Load tables from saved context
        for (const [key, value] of Object.entries(saved_context.tables)) {
            this.context.tables[key] = new Table(this, value);
        }

        this.context.current_table = saved_context.current_table;
        this.interface?.loadTheme(this.context.tables[this.context.current_table].theme);
    }

    process = (): string | void  => {
        if (this.interface) return this.interface.drawGrid(this.context);
        else throw new Error("Can't process without interface");
    }

    // Preparing SavedContext for localstorage
    save = (): SavedContext => {
        const tables_state: {[key: string]: object} = {}
        for (const [key, value] of Object.entries(this.context.tables)) {
            tables_state[key] = value.data;
        };
        let cursor_state = this.context.cursor.getCursorData();
        let current_table = this.context.current_table;
        return {
            'tables': tables_state,
            'cursor': cursor_state,
            'current_table': current_table,
        }
    }

    startAudioContext = () => {
        this.audio_context.resume();
    }

    // Get context from local storage and hash it to url parameter
    getHash = (): string => {
        return btoa(JSON.stringify(this.save()));
    }

    // Parse context from hashed string
    parseHash = (hash: string) => {
        return JSON.parse(atob(hash));
    }

}