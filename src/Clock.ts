import type { Application } from './Application';
// @ts-ignore
import { TransportNode } from './TransportNode';

// import { evaluate } from './Evaluator';

export class Clock {
    evaluations: number
    transportNode: TransportNode

    constructor(public app: Application, ctx: AudioContext) {
        this.evaluations = 0;
        // Resolve the promise here
        ctx.audioWorklet.addModule('src/TransportProcessor.js').then((e) => {
            this.transportNode = new TransportNode(ctx, {}, this.app);
            this.transportNode.connect(ctx.destination);
            return e
        })
        .catch((e) => {
            console.log('Error loading TransportProcessor.js:', e);
        })
    }

    start(): void {
        this.transportNode?.start();
    }

    // Public methods
    public toString(): string { return `` }
}