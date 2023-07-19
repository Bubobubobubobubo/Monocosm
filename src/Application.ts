import { Clock } from './Clock.js';
import { Camera } from './Camera.js';
import { Cursor } from './Cursor.js';
import { Table } from './Table.js';
import { InputHandler } from './InputHandler.js';
import { TextInterface } from './TextInterface.js';
import { MidiOut } from './IO/Midi.js';
import { Context, SavedContext, OutputType } from './Types.js';
import { UserAPI } from './UserAPI.js';
import { ActionArea } from './Crawler.js';

export class Application {

    audio_context: AudioContext | null = null;
    clock: Clock | null = null;
    userAPI: UserAPI;
    midi: MidiOut;
    context!: Context;
    input: InputHandler;
    redraw: boolean;
    replaceGrid: boolean;
    last_grid: DocumentFragment | null;
    interface: TextInterface;
    running: boolean = false;
    gridMode: 'grid' | 'local' | 'global' = 'grid';
    cursorElement: HTMLElement = document.getElementById("cursor") as HTMLElement;
    gridElement: HTMLElement = document.getElementById("grid") as HTMLElement;
    
    constructor(public output_type: OutputType) {
        this.input = new InputHandler(this);
        this.userAPI = new UserAPI(this);
        this.midi = new MidiOut();
        this.redraw = true;
        this.replaceGrid = true;
        this.last_grid = null;
        this.interface = undefined as unknown as TextInterface;
        this.init()
    }

    startTime(): void {
        this.audio_context = new AudioContext();
        this.clock = new Clock(this, this.audio_context);
        this.clock.start();
    }

    init = () => {
        if (this.output_type == 'text') {
            this.interface = new TextInterface(this);
            this.context = {
                'mainScript': {committed_code: '/* MAIN SCRIPT */', temporary_code: '', evaluations: 0},
                'camera': new Camera(this,
                    this.interface.howManyCharactersFitWidth(),
                    this.interface.howManyCharactersFitHeight()
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
                this.loadContextFromUrl(urlParams);
            } else if (localStorage.getItem('context') !== null) {
                 // Resume from localStorage data
                const saved_context: SavedContext = JSON.parse(
                    localStorage.getItem('context') as string
                );
                this.loadFromSavedContext(saved_context);
            }

            if(urlParams.has('universe')) {
                this.loadUniverseFromUrl(urlParams);
            }

        } else {
            throw new Error('Output type not supported');
        }

        // Loading the current script for universe
        this.interface?.loadScript(this.getCurrentTable().script);
        this.interface?.loadScript(this.context.mainScript, 'global');
    }

    loadUniverseFromUrl = (urlParams: URLSearchParams) => {
        let universeHash = urlParams.get('universe') as string;
        // Split to name and content. Name is separated with "-"
        let [universeName, universeContent] = universeHash.split('-');

        // Decode the content
        let table = this.parseHash(universeContent);
        this.context.tables[universeName] = new Table(this, table);
        this.context.current_table = universeName;
        this.interface?.loadTheme(this.getCurrentTable().theme);
        this.emptyUrl();
    }

    loadContextFromUrl = (urlParams: URLSearchParams) => {
        const url_context = this.parseHash(urlParams.get('context') as string);
        this.loadFromSavedContext(url_context);
        this.emptyUrl();
    }

    emptyUrl = () => {
        window.history.replaceState({}, document.title, "/");
    }

    loadFromSavedContext = (saved_context: SavedContext) => {
         this.context.cursor.createFromStoredContext(saved_context.cursor);

        // Load tables from saved context
        for (const [key, value] of Object.entries(saved_context.tables)) {
            this.context.tables[key] = new Table(this, value);
        }

        this.context.current_table = saved_context.current_table;
        this.interface?.loadTheme(this.context.tables[this.context.current_table].theme);
        this.context.mainScript = saved_context.mainScript;
    }

    process = (): DocumentFragment | void | null => {
       /* if (this.gridMode == 'grid') {
            if (this.interface) return this.interface.createWholeGrid();
            else throw new Error("Can't process without interface");
        } else */ 
        if (this.gridMode == 'local') {
            if (this.interface) return this.interface.createEditor('local');
            else throw new Error("Can't process without interface");
        } else {
            if (this.interface) return this.interface.createEditor('global');
            else throw new Error("Can't process without interface");
        } 
    }

    // Preparing SavedContext for localstorage
    save = (): SavedContext => {
        const tables_state: {[key: string]: object} = {}
        for (const [key, value] of Object.entries(this.context.tables)) {
            tables_state[key] = value.data;
        };
        let cursor_state = this.context.cursor.getCursorData();
        let current_table = this.context.current_table;
        let mainScript = this.context.mainScript;
        return {
            'mainScript': mainScript,
            'tables': tables_state,
            'cursor': cursor_state,
            'current_table': current_table,
        }
    }

    // Get context from local storage and hash it to url parameter
    getHash = (): string => {
        return btoa(JSON.stringify(this.save()));
    }

    // Get current table as hash
    getTableHash = (): string => {
        // Get Object.entries from table
        const tableEntries = this.getCurrentTable().data;
        return btoa(JSON.stringify(tableEntries));
    }

    // Parse context from hashed string
    parseHash = (hash: string) => {
        return JSON.parse(atob(hash));
    }

    getCurrentTable = () => {
        return this.context.tables[this.context.current_table];
    }

    getCurrentUniverseName = () => {
        return this.context.current_table;
    }

    getUniverseIndex = () => {
        // Calculate index for the current universe from the table list
        let table_list = Object.keys(this.context.tables);
        return table_list.indexOf(this.context.current_table);
    }

    getTableWithIndex = (index: number) => {
        // Calculate index for the current universe from the table list
        let table_list = Object.keys(this.context.tables);
        return table_list[index - 1];
    }
    
    getTable = (name: string): Table | boolean  => {
        if (name in this.context.tables) {
            return this.context.tables[name];
        } else {
            return false;
        }
    }

    getVisibleZone = () => {
        return this.context.camera.getVisibleZone();
    }

    getCursor = () => {
        return this.context.cursor;
    }

}