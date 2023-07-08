import type { Application } from "./Application.js";
import { Table } from "./Table.js";
import type { Commands } from './Types.js';

// Themes from the CSS
const themes: string[] = [
    "white", "dark",
    "black", "royal",
    "bee", "lavender",
    "jungle", "forest",
    "sky", "cherry",
    "blue", "yellow",
    "hurt", "sugar",
    "neon", "atoll"
]


export class Command {

    commands: Commands;

    constructor(public app: Application) {
        // Create a command list that takes a string and returns a function
        this.commands = {
            'bpm': this.bpm,
            'right': this.moveRight,
            'left': this.moveLeft,
            'up': this.moveUp,
            'down': this.moveDown,
            'midi': this.miditest,
            'midioutput': this.midioutput,
            'teleport': this.teleport,
            'tp': this.teleport,
            'origin': this.origin,
            'clear': this.clear,
            'erase': this.erase,
            'universe': this.universe,
            'theme': this.theme,
            'share': this.share,
            'apocalypse': this.apocalypse,
        }
    }

    parse = (expression: string): void => {
        
        // Make the expression case insensitive
        expression = expression.toLowerCase();

        // Multiple commands can exist, they are separated by ;
        let commands = expression.split(';');

        // Remove whitespace in front of command if whitespace
        commands = commands.map(command => command.trim());

        // Every command is composed by a command and its arguments
        commands.forEach(command => {
            let [cmd, ...args] = command.split(' ');
            if (cmd in this.commands) {
                this.commands[cmd](args);
            } else {
                Error('Command not found');
            }
        })
    }

    move = (y: number, x:number):void  => {
        // Move the cursor to a given position
        this.app.context.cursor.y = y;
        this.app.context.cursor.x = x;
    }

    teleport = (args: string[]):void => {
        if (args.length < 2) { return ; }
        // Teleport the cursor to a given position
        this.app.context.cursor.y = parseInt(args[0]);
        this.app.context.cursor.x = parseInt(args[1]);
    }

    miditest = ():void => {
        // Test MIDI output
        this.app.midi._noteOn(60, 127, 0);
        this.app.midi._noteOff(60, 0);
    }

    midioutput = (output_name: string):void => {
        this.app.midi.chooseMidiOutput(output_name);
    }

    origin = ():void => {
        // Get cursor back at origin
        this.app.context.cursor.y = 0;
        this.app.context.cursor.x = 0;
    }


    isTheme = (theme_name: string):boolean => {
        return themes.includes(theme_name)
    }

    theme = (theme_name: string):void => {
        this.app.interface?.setTheme(theme_name);
    }

    getUniverseTheme = (universe_name: string):string => {
        // If part of the universe name is same as one of the themes, find first match
        let theme = themes.find(theme => universe_name.includes(theme));
        if (theme) {
            return theme;
        } else {
            // Get random theme
            return themes[Math.floor(Math.random() * themes.length)];
        }
    }

    universe = (universe_params: string[]):void => {
        const universe_name = universe_params.join(' ');
        if (universe_name in this.app.context.tables) { 
            this.app.context.current_table = universe_name;
            this.app.interface?.loadTheme(this.app.context.tables[universe_name].theme);
            this.app.interface?.loadScript(this.app.context.tables[universe_name].script)
        } else {
            this.app.context.tables[universe_name] = new Table(this.app);
            this.app.context.current_table = universe_name;
            this.app.interface?.loadTheme(this.getUniverseTheme(universe_name));
            this.app.interface?.loadScript(this.app.context.tables[universe_name].script)
        }
    }

    clear = ():void => {
        // Clear the grid
        this.app.context.tables[this.app.context.current_table].clear();
    }

    moveRight = (args: string[]):void => {
        // Move the cursor right
        if (args.length > 0) {
            this.app.context.cursor.x += parseInt(args[0]);
        } else {
            this.app.context.cursor.x += 1;
        }
    }

    moveUp = (args: string[]):void => {
        // Move the cursor up
        if (args.length > 0) {
            this.app.context.cursor.y -= parseInt(args[0]);
        } else {
            this.app.context.cursor.y -= 1;
        } 
    }

    moveLeft = (args: string[]):void => {
        // Move the cursor left
        if (args.length > 0) {
            this.app.context.cursor.x -= parseInt(args[0]);
        } else {
            this.app.context.cursor.x -= 1;
        }
    }

    moveDown = (args: string[]):void => {
        // Move the cursor down
        if (args.length > 0) {
            this.app.context.cursor.y += parseInt(args[0]);
        } else {
            this.app.context.cursor.y += 1;
        }
    }

    // Erase from x, y to x, y
    erase = (args: string[]):void => {
        let [x1, y1, x2, y2] = args;
        this.app.context.tables[this.app.context.current_table].removeZone(
            parseInt(x1), parseInt(y1), parseInt(x2), parseInt(y2)
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
    }

    bpm = (bpm: string[]):void => {
        this.app.clock.bpm = parseFloat(bpm[0]);
    }
}