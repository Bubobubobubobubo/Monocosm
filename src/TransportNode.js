export class TransportNode extends AudioWorkletNode {
    constructor(context, options) {
        super(context, "transport", options);
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
    };
    start() {
        this.port.postMessage("start");
    }
}