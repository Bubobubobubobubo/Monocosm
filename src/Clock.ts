import * as Tone from 'tone';
import type { Application } from './Application';
import { evaluate } from './Evaluator';

export class Clock {

    evaluations: number;

    constructor(public app: Application) {
        this.evaluations = 0;
    }

    // Public methods
    public toString(): string {
        return `BPM: ${Tone.Transport.bpm.value} | ${Tone.Transport.position}`
    }
}