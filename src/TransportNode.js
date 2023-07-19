import { evaluate } from "./Evaluator";

export class TransportNode extends AudioWorkletNode {

    constructor(context, options, application) {

        super(context, "transport", options);
        this.app = application
        this.port.addEventListener("message", this.handleMessage);
        this.port.start();
        /** @type {HTMLSpanElement} */
        this.$text = document.getElementById("clock");
    }
    /** @type {(this: MessagePort, ev: MessageEvent<any>) => any} */
    handleMessage = (message) => {
        if (message.data === "bang")
            this.$text.innerHTML = this.context.currentTime;
            console.log(this.context.currentTime)
            evaluate(this.app, this.app.context.mainScript);
            this.app.context.mainScript.evaluations++;
    };
    start() {
        this.port.postMessage("start");
    }
}