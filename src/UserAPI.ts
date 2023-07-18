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
            evaluate(
                this.app, 
                table.script as Script
            );
        }
    }
    b = this.bang;

    move = (x: number, y: number):void => {
        if (x === null || y === null) { return ; }
        // Teleport the cursor to a given position
        this.app.context.cursor.setXY(x, y);
    }

    teleport = (x: number, y: number):void => {
        if (x === null || y === null) { return ; }
        // Teleport the cursor to a given position
        this.app.context.cursor.setXY(x, y);
    }

    origin = ():void => {
        // Get cursor back at origin
        this.app.context.cursor.setXY(0, 0);
    }

    theme = (theme_name: string):void => {
        this.app.interface?.setTheme(theme_name);
    }

    // Private methods
    // private _isTheme = (theme_name: string):boolean => {
    //     return themes.includes(theme_name)
    // }

    private _getUniverseTheme = (name: string, theme: string): string => {
        // If part of the universe name is same as one of the themes, find first match
        if(themes && themes.includes(theme)) {
            return theme;
        } else if(themes.includes(name)) {
            return name;
        } else {
            // Find first partial match from themes array
            const partialName = themes.find((t) => name.includes(t));
            if (partialName) {
                return partialName;
            } else {
                return themes[Math.floor(Math.random() * themes.length)];
            }
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
            const themeName = this._getUniverseTheme(name, theme);
            this.app.context.tables[name].theme = themeName;
            this.app.interface?.loadTheme(themeName);
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

    right = (amount: number = 1):void => {
        // Move the cursor right
            this.app.context.cursor.incrementX(amount);
    }

    up = (amount: number = 1):void => {
        // Move the cursor up
        this.app.context.cursor.incrementY(-amount);
    }

    left = (amount: number = 1):void => {
        // Move the cursor left
        this.app.context.cursor.incrementX(-amount);
    }

    down = (amount: number = 1):void => {
        // Move the cursor down
        this.app.context.cursor.incrementY(amount);
    }

    // Erase from x, y to x, y
    erase = (x1: number, y1: number, x2: number, y2: number):void => {
        this.app.context.tables[this.app.context.current_table].removeZone(
            x1, y1, x2, y2
        );
    }

    // Dump context to url paramater
    dump = ():void => {
        const hash_context = this.app.getHash();
        const url = new URL(window.location.href);
        url.searchParams.set('context', hash_context);
        window.history.replaceState({}, '', url.toString());
    }

    // Share current universe
    share = ():void => {
        // Get current table
        const hashed_table = this.app.getTableHash();
        const url = new URL(window.location.href);
        console.log(hashed_table);
        url.searchParams.set('universe', this.app.getCurrentUniverseName()+"-"+hashed_table);
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
        this.app.clock?.pause()
    }

    resume = ():void => {
        this.app.clock?.start()
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

    // ============================================================ 
    // Getters section
    // ============================================================ 

    get tick():number {
        return 0
    }

    get beat():number {
        return 0
    }

    get bar():number {
        return 0
    }

    get x():number { return this.app.context.cursor.getX(); }
    get y():number { return this.app.context.cursor.getY(); }

    get i():number { 
        if (this.app.clock) {
            return this.app.clock.evaluations; 
        } else {
            return 0
        }
    }
    get _():number { return this.app.getCurrentTable().script.evaluations; }

}