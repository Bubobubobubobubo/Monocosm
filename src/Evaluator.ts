import type { Script } from './Types';
import type { Application } from './Application';

export const tryEvaluate = (application: Application, script: Script): void => {
    let isValidCode: boolean;
    try {
        Function(`with (this) {${script.temporary_code}}`).call(application.userAPI)
        isValidCode = true;
    } catch (error) {
        Function(`with (this) {${script.committed_code}}`)()
        isValidCode = false;
    }

    if (isValidCode) {
        script.committed_code = script.temporary_code; 
    } 
}

export const evaluate = (application: Application, script: Script): void => {
    Function(`with (this) {${script.committed_code}}`).call(application.userAPI)
}

export const evaluateCommand = (application: Application, command: string): void => {
    Function(`with (this) {${command}}`).call(application.userAPI)
}