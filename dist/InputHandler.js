export class InputHandler {
    constructor(app) {
        this.app = app;
        this.setup = () => {
            for (const listener in this.listeners) {
                window.addEventListener("keydown", this.listeners[listener]);
            }
        };
        this.keyDownHandler = (event) => {
            if (event.key == 'ArrowDown') {
                this.app.context.cursor.y -= 1;
            }
        };
        this.keyUpHandler = (event) => {
            if (event.key == 'ArrowUp') {
                this.app.context.cursor.y += 1;
            }
        };
        this.keyLeftHandler = (event) => {
            if (event.key == 'ArrowLeft') {
                this.app.context.cursor.x -= 1;
            }
        };
        this.keyRightHandler = (event) => {
            if (event.key == 'ArrowRight') {
                this.app.context.cursor.x += 1;
            }
        };
        this.listeners = {
            'keydown': this.keyDownHandler,
            'keyup': this.keyUpHandler,
            'keyleft': this.keyLeftHandler,
            'keyright': this.keyRightHandler,
        };
        this.setup();
    }
}
