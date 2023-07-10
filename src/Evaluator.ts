import type { Script } from './Types';
import type { Application } from './Application';

export const tryEvaluate = (application: Application, script: Script): void => {
    let isValidCode: boolean;
    try {
        Function(`with (this) {try{${script.temporary_code}} catch (e) {console.log(e)}};`).call(application.userAPI)
        isValidCode = true;
        application.redraw = true; 
    } catch (error) {
        Function(`with (this) {try{${script.committed_code}} catch (e) {console.log(e)}};`)()
        isValidCode = false;
    }

    if (isValidCode) {
        script.committed_code = script.temporary_code; 
    } 
}

export const evaluate = (application: Application, script: Script): void => {
    Function(`with (this) {try{${script.committed_code}} catch (e) {console.log(e)}};`).call(application.userAPI)
    script.evaluations++;
}

export const evaluateCommand = (application: Application, command: string): void => {
    Function(`with (this) {try{${command}} catch (e) {console.log(e)}};`).call(application.userAPI)
}