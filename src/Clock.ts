import "zyklus";

export class Clock {

    public bpb: number = 4
    public bpm: number = 120
    public bar: number = -1
    public beat: number = 0
    public tick: number = 0
    public time: number = 0.0
    public rate: number = 0.1
    private clock: any

    constructor(public ctx: AudioContext) {
        // this.clock = this.ctx.createClock((time: number, duration: number, tick: number) => {
        //     this.time = time;
        //     this.tick = tick;
        //     // console.log(time, duration, tick);
        //     this.updateClock()
        // }, this.bpmToRate()).start();
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