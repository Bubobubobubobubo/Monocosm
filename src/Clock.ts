import * as Tone from 'tone';
import type { Application } from './Application';
import { evaluate } from './Evaluator';

export class Clock {

    private clock: any

    constructor(public app: Application) {
        Tone.Transport.start();
        Tone.Transport.bpm.value = 120;
        Tone.Transport.scheduleRepeat((time) => {
            evaluate(this.app, this.app.context.mainScript);
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
        return `BPM: ${Tone.Transport.bpm.value} | ${Tone.Transport.position}`
    }
}