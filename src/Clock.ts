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
    private smallestDivision: number = 24

    constructor(public ctx: AudioContext) {
        this.clock = this.ctx.createClock((time: number, duration: number, tick: number) => {
            this.time = time;
            this.tick = tick;
            // console.log(time, duration, tick);
            this.updateClock()
        }, this.bpmToRate()).start();
    }

    // Update clock information
    private updateClock(): void {
        let result = this.divmod(this.tick, this.smallestDivision);
        this.beat = result[0], this.tick = result[1];
        this.bar = Math.floor(this.beat / this.bpb);
    }

    // Setters and getters
    set setBpm(bpm: number) {
        this.bpm = bpm;
    }

    get getBpm(): number {
        return this.clock.bpm;
    }


    // BPM To rate. The rate is the smallestDivision of one beat
    private bpmToRate(): number {
        return 60 / this.bpm / this.smallestDivision;
    }

    // Public methods
    public toString(): string {
        return `${this.bar}:${this.beat}:${this.tick}`;
    }

    private divmod = (x: number, y:number): number[] => [Math.floor(x / y), x % y];
}