import * as Tone from 'tone';
import type { Application } from './Application';
import { evaluate, tryEvaluate } from './Evaluator';

export class Clock {

    public bpm: number = 120
    public bpb: number = 4
    public tickPerBeat: number = 4

    public bar: number = 0
    public beat: number = 1
    public tick: number = 0
    public time: number = 0.0
    public rate: number = 0.1
    private clock: any

    constructor(public app: Application) {
        Tone.Transport.start();
        Tone.Transport.bpm.value = this.bpm;
        Tone.Transport.scheduleRepeat((time) => {
            this.tick++;
            this.beat = Math.floor(this.tick / Math.floor(this.tickPerBeat * this.bpb)) + 1;
            this.bar = Math.floor(this.beat / this.bpb)
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
        return `${this.bar}:${this.beat}:${this.tick}`;
    }
}