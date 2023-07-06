// ====================================================================================
// Code taken from Zyklus (https://github.com/felixroos/zyklus/blob/main/src/zyklus.ts)
// ====================================================================================

AudioContext.prototype['createClock'] = function (
  callback: CallableFunction, // called slightly before each cycle
  duration: number, // duration of each cycle
  interval = 0.1, // interval between callbacks
  overlap = 0.1, // overlap between callbacks
) {
  let tick = 0; // counts callbacks
  let phase = 0; // next callback time
  let precision = 10 ** 4; // used to round phase
  let minLatency = 0.01;
  const setDuration = (setter) => (duration = setter(duration));
  overlap = overlap || interval / 2;
  const onTick = () => {
    const t = this.currentTime;
    const lookahead = t + interval + overlap; // the time window for this tick
    if (phase === 0) {
      phase = t + minLatency;
    }
    // callback as long as we're inside the lookahead
    while (phase < lookahead) {
      phase = Math.round(phase * precision) / precision;
      phase >= t && callback(phase, duration, tick);
      phase += duration; // increment phase by duration
      tick++;
    }
  };
  let intervalID;
  const start = () => {
    onTick();
    intervalID = setInterval(onTick, interval * 1000);
  };
  const clear = () => clearInterval(intervalID);
  const pause = () => clear();
  const stop = () => {
    tick = 0;
    phase = 0;
    clear();
  };
  // setCallback
  return { setDuration, start, stop, pause, duration };
};


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