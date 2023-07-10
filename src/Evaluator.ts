import type { Script } from './Types';
import type { Application } from './Application';

export const tryEvaluate = (application: Application, script: Script, ...args: object[]): void => {
    let isValidCode: boolean;
    try {
        Function(`with (this) { return ${script.committed_code} }`).call(application.userAPI, args)
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
    Function(`with (this) { return ${script.committed_code} }`).call(application.userAPI, args)
}

export const evaluateCommand = (application: Application, command: string, ...args: object[]): void => {
    Function(`with (this) { return ${command} }`).call(application.userAPI, args)
}