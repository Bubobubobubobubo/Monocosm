import { Application } from "./Application";

export class UserAPI {

    app: Application
    api: object

    constructor(app: Application) {
        this.app = app;
        this.api = {
            'bang': this.bang,
        };
    }

    bang = (universe: string) => {
        console.log('bang')
    }
}