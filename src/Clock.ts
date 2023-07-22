import type { Application } from './Application';
import { evaluate } from './Evaluator';
import { clearInterval, setInterval } from 'worker-timers';

interface ClockMethods {
    setDuration: CallableFunction;
    start: CallableFunction; 
    stop: CallableFunction;
    pause: CallableFunction;
    duration: number; 
}

declare global {
    interface AudioContext {
        createClock(
          callback: CallableFunction, 
          duration: number, 
          interval?: number, 
          overlap?: number
        ): ClockMethods;
    }
}

AudioContext.prototype['createClock'] = function (
  callback, // called slightly before each cycle
  duration, // duration of each cycle
  interval = 0.2, // interval between callbacks
  overlap = 0.2, // overlap between callbacks
) {
  let tick = 0; // counts callbacks
  let phase = 0; // next callback time
  let precision = 10 ** 2; // used to round phase
  let minLatency = 0.01;
  const setDuration = (setter: any) => (duration = setter(duration));
  overlap = overlap || interval / 2;
  const onTick = () => {
    const t = this.currentTime;
    // TODO: why do I need to do that? Is it something that I inherited from Tidal?
    // const lookahead = t + interval + overlap; // the time window for this tick
    const lookahead = t + interval; // the time window for this tick
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
  let intervalID: any;
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

    time: number;
    tick: number;
    evaluations: number;
    setDuration: CallableFunction;
    start: CallableFunction; 
    stop: CallableFunction;
    pause: CallableFunction;
    duration: number; 

    constructor(public app: Application, ctx: AudioContext) {
        this.evaluations = 0;
        this.time = 0;
        this.tick = 0;
        const clock = ctx.createClock((time: number, duration: number, tick: number) => {
            // this.app.userAPI.beep()
            this.time = time; this.tick = tick; this.duration = duration;
            evaluate(this.app, this.app.context.mainScript);
            this.evaluations++;
        }, 0.2);

        // Grab what's inside that clock
        this.setDuration = clock.setDuration;
        this.start = clock.start;
        this.stop = clock.stop;
        this.pause = clock.pause;
        this.duration = clock.duration;

        // Start the clock in a second time
        clock.start();
    }

    // Public methods
    public toString(): string {
        return `${this.time} ${this.tick}`
    }
}