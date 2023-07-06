import "zyklus";

export class Clock {

    bpm: number
    bpb: number
    time: number
    ctx: AudioContext
    clock: any

    constructor(ctx: AudioContext, bpm: number, bpb: number) {
        this.bpm = bpm; this.bpb = bpb;
        this.time = 0.0;
        this.ctx = ctx;
        this.clock = this.ctx.createClock(
            (
                time: number, 
                duration: number, 
                tick: number
            ) => {
            console.log(time, duration, tick);
        }, 0.2).start();
    }
}