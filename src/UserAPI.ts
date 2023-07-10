import { Application } from "./Application";
import { Script } from "./Types";
import { evaluate } from "./Evaluator";
import { Table } from "./Table";

// Themes from the CSS
const themes: string[] = [
    "white", "dark",
    "black", "royal",
    "bee", "lavender",
    "jungle", "forest",
    "sky", "cherry",
    "blue", "hurt",
    "sugar", "neon",
    "atoll"
]

export class UserAPI {

    app: Application

    constructor(app: Application) {
        this.app = app;
    }

    log = console.log;

    bang = (universe: string) => {
        let table = this.app.getTable(universe);
        if (table) {
            table = table as Table;
            evaluate(this.app, table.script as Script);
        }
    }
    b = this.bang;

    move = (x: number, y: number):void => {
        if (x === null || y === null) { return ; }
        // Teleport the cursor to a given position
        this.app.context.cursor.x = x;
        this.app.context.cursor.y = y;
    }

    teleport = (x: number, y: number):void => {
        if (x === null || y === null) { return ; }
        // Teleport the cursor to a given position
        this.app.context.cursor.x = x;
        this.app.context.cursor.y = y;
    }


    origin = ():void => {
        // Get cursor back at origin
        this.app.context.cursor.y = 0;
        this.app.context.cursor.x = 0;
    }

    theme = (theme_name: string):void => {
        this.app.interface?.setTheme(theme_name);
    }

    // Private methods
    // private _isTheme = (theme_name: string):boolean => {
    //     return themes.includes(theme_name)
    // }

    private _getUniverseTheme = (theme? :string):string => {
        // If part of the universe name is same as one of the themes, find first match
        if (theme) {
            return theme;
        } else {
            return themes[Math.floor(Math.random() * themes.length)];
        }
    }

    universe = (name: string, theme: string):void => {
        if (name in this.app.context.tables) { 
            this.app.context.current_table = name;
            this.app.interface?.loadTheme(this.app.context.tables[name].theme);
            this.app.interface?.loadScript(this.app.context.tables[name].script)
        } else {
            this.app.context.tables[name] = new Table(this.app);
            this.app.context.current_table = name;
            this.app.interface?.loadTheme(this._getUniverseTheme(theme));
            this.app.interface?.loadScript(this.app.context.tables[name].script)
        }
    }

    clear = ():void => {
        // Clear the grid
        this.app.context.tables[this.app.context.current_table].clear();
    }

    clearLocalScript = ():void => {
        this.app.context.tables[this.app.context.current_table].script.committed_code = '';
        this.app.context.tables[this.app.context.current_table].script.temporary_code = '';
        this.app.interface?.clearEditor('local');
    }

    clearGlobalScript = ():void => {
        this.app.context.mainScript.committed_code = '';
        this.app.context.mainScript.temporary_code = '';
        this.app.interface?.clearEditor('global');
    }

    right = (amount: number):void => {
        // Move the cursor right
        if (amount) {
            this.app.context.cursor.x += amount;
        } else {
            this.app.context.cursor.x += 1;
        }
    }

    up = (amount: number):void => {
        // Move the cursor up
        if (amount) {
            this.app.context.cursor.y -= amount;
        } else {
            this.app.context.cursor.y -= 1;
        } 
    }

    left = (amount: number):void => {
        // Move the cursor left
        if (amount) {
            this.app.context.cursor.x -= amount;
        } else {
            this.app.context.cursor.x -= 1;
        }
    }

    down = (amount: number):void => {
        // Move the cursor down
        if (amount) {
            this.app.context.cursor.y += amount;
        } else {
            this.app.context.cursor.y += 1;
        }
    }

    // Erase from x, y to x, y
    erase = (x1: number, y1: number, x2: number, y2: number):void => {
        this.app.context.tables[this.app.context.current_table].removeZone(
            x1, y1, x2, y2
        );
    }

    // Share context to url paramater
    share = ():void => {
        const hash_context = this.app.getHash();
        const url = new URL(window.location.href);
        url.searchParams.set('context', hash_context);
        window.history.replaceState({}, '', url.toString());
    }

    // Clear context from localstorage
    apocalypse = ():void => {
        localStorage.removeItem('context');
        window.history.replaceState({}, '', window.location.href.split('?')[0]);
        this.app.init();
        window.location.reload();
    }

    bpm = (bpm: string[]):void => {
    }

    start = ():void => {
        // Start the scheduling engine
        if (this.app.audio_context) {
            this.app.audio_context.resume();
        } else {
            this.app.startTime()
        }
    }

    pause = ():void => {
        // Pause the scheduling engine
    }

    resume = ( ):void => {
        // Resume the scheduling engine
    }

    bigbang = ():void => {
    }

    bip = (): void  => {
    }

    sync = () => {
        if (this.app.clock) this.app.clock.evaluations = 0;
        for (const table in this.app.context.tables) {
            this.app.context.tables[table].script.evaluations = 0; 
        }
    }

    every = (evaluations: number): boolean => {
        if (this.app.clock)
            return this.app.clock.evaluations % evaluations == 0;
        return false;
    }
    e = this.every;

    note = (note: number, velocity: number, channel: number):void => {
        this.app.midi.note(note, velocity, channel)
    }


    // Important getters!

    get tick():number {
        return 0
    }

    get beat():number {
        return 0
    }

    get bar():number {
        return 0
    }

    get x():number { return this.app.context.cursor.x; }
    get y():number { return this.app.context.cursor.x; }
    get i():number { 
        if (this.app.clock) {
            return this.app.clock.evaluations; 
        } else {
            return 0
        }
    }
    get _():number { return this.app.getCurrentTable().script.evaluations; }

}