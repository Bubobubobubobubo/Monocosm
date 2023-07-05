import type { Application } from "./Application.js";
import { Table } from "./Table.js";

export class Command {

    commands: object;

    constructor(public app: Application) {
        // Create a command list that takes a string and returns a function
        this.commands = {
            'midi': this.miditest,
            'teleport': this.teleport,
            'origin': this.origin,
            'clear': this.clear,
            'universe': this.universe,
        }
    }

    parse = (expression: string): void => {

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
}