import type { Application } from "./Application.js";
import { Table } from "./Table.js";

interface Commands {
    [key: string]: Function;
}

export class Command {

    commands: Commands;

    constructor(public app: Application) {
        // Create a command list that takes a string and returns a function
        this.commands = {
            'right': this.moveRight,
            'left': this.moveLeft,
            'up': this.moveUp,
            'down': this.moveDown,
            'midi': this.miditest,
            'midioutput': this.midioutput,
            'teleport': this.teleport,
            'origin': this.origin,
            'clear': this.clear,
            'erase': this.erase,
            'universe': this.universe,
            'theme': this.theme,
        }
    }

    parse = (expression: string): void => {

        console.log('Received expression: ' + expression)

        // Multiple commands can exist, they are separated by ;
        let commands = expression.split(';');

        // Remove whitespace in front of command if whitespace
        commands = commands.map(command => command.trim());

        // Every command is composed by a command and its arguments
        commands.forEach(command => {
            let [cmd, ...args] = command.split(' ');
            if (cmd in this.commands) {
                console.log('Launching command ' + cmd + ' with args ' + args)
                this.commands[cmd](args);
            } else {
                Error('Command not found');
            }
        })
    }

    move = (y: number, x:number) => {
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

    // Themes from the CSS
    themes = ["white", "dark", "black", "royal", "bee", "lavender", "jungle", "forest", "sky", "cherry", "blue", "yellow", "hurt", "sugar", "neon", "atoll"]

    isTheme = (theme_name: string):boolean => {
        return this.themes.includes(theme_name)
    }

    theme = (theme_name: string):void => {
        this.app.interface?.setTheme(theme_name);
    }

    getUniverseTheme = (universe_name: string):string => {
        // If part of the universe name is same as one of the themes, find first match
        let theme = this.themes.find(theme => universe_name.includes(theme));
        if (theme) {
            return theme;
        } else {
            // Get random theme
            return this.themes[Math.floor(Math.random() * this.themes.length)];
        }
    }

    universe = (universe_params: string[]):void => {
        const universe_name = universe_params.join(' ');
        if (universe_name in this.app.context.tables) { 
            this.app.context.current_table = universe_name;
            this.app.interface?.loadTheme(this.app.context.tables[universe_name].theme);
        } else {
            this.app.context.tables[universe_name] = new Table(this.app);
            this.app.context.current_table = universe_name;
            this.app.interface?.loadTheme(this.getUniverseTheme(universe_name));
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
}