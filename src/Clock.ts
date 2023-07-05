export class Clock {

    bpm: number
    bpb: number
    time: number

    constructor(bpm: number, bpb: number) {
        this.bpm = bpm; this.bpb = bpb;
        this.time = 0.0;
    }

}