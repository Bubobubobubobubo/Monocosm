import * as Tone from 'tone';
import type { Application } from './Application';

export class Clock {

    public bpb: number = 4
    public bpm: number = 120
    public bar: number = -1
    public beat: number = 0
    public tick: number = 0
    public time: number = 0.0
    public rate: number = 0.1
    private clock: any

    constructor(public app: Application) {
        Tone.Transport.start();
        Tone.Transport.bpm.value = this.bpm;
        Tone.Transport.scheduleRepeat((time) => {
            // print the content of every script in known universes
            for (const [key, value] of Object.entries(this.app.context.tables)) {
                console.log(key, value.script)
            }
        }, "64n")
    }

    // Setters and getters
    set setBpm(bpm: number) {
        this.bpm = bpm;
    }

    get getBpm(): number {
        return this.clock.bpm;
    }

    // Public methods
    public toString(): string {
        return `${this.bar}:${this.beat}:${this.tick}`;
    }
}