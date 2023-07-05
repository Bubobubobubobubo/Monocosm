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
            'universe': this.universe,
        }
    }

    parse = (expression: string): void => {

        console.log('Received expression: ' + expression)

        // Remove the word 'Enter' from expression ending
        expression = expression.slice(0, -5);

        // Break the expression at whitespace and separate command from arguments
        let [command, ...args] = expression.split(' ');

        if (command in this.commands) {
            this.commands[command](args);
        } else {
            Error('Command not found'); 
        };

    }

    teleport = (y: number, x: number) => {
        // Teleport the cursor to a given position
        this.app.context.cursor.y = y;
        this.app.context.cursor.x = x;
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

    universe = (universe_name: string):void => {
        if (universe_name in this.app.context.tables) { 
            this.app.context.current_table = universe_name;
        } else {
            this.app.context.tables[universe_name] = new Table(this.app);
            this.app.context.current_table = universe_name;
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
}