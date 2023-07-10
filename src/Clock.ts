import * as Tone from 'tone';
import type { Application } from './Application';
import { evaluate } from './Evaluator';

export class Clock {

    evaluations: number;

    constructor(public app: Application) {
        this.evaluations = 0;
        Tone.Transport.start();
        Tone.Transport.bpm.value = 120;
        Tone.Transport.scheduleRepeat(() => {
            evaluate(this.app, this.app.context.mainScript);
            this.evaluations++;
        }, "32n")
    }

    // Public methods
    public toString(): string {
        return `BPM: ${Tone.Transport.bpm.value} | ${Tone.Transport.position}`
    }
}