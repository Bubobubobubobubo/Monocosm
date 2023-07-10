import type { Script } from './Types';
import type { Application } from './Application';

export const tryEvaluate = (app: Application, script: Script, ...args: object[]): void => {
    let isValidCode: boolean;
    try {
        Function(script.temporary_code).call(app, args)
        isValidCode = true;
    } catch (error) {
        Function(script.committed_code)()
        isValidCode = false;
    }

    if (isValidCode) {
        script.committed_code = script.temporary_code; 
    } 
}

export const evaluate = (application: Application, script: Script, ...args: object[]): void => {
    Function(script.committed_code).call(application, args)
}