import type { Script } from './Types';
import type { Application } from './Application';
import { UserAPI } from './UserAPI';

export const tryEvaluate = (app: Application | object, script: Script, ...args: object[]): void => {
    let isValidCode: boolean;
    try {
        //Function(script.temporary_code).call(app, args)
        Function(`with (this) { return ${script.committed_code} }`).call(UserAPI, args)
        isValidCode = true;
    } catch (error) {
        Function(script.committed_code)()
        isValidCode = false;
    }

    if (isValidCode) {
        script.committed_code = script.temporary_code; 
    } 
}

export const evaluate = (application: Application | object, script: Script, ...args: object[]): void => {
    //Function(script.committed_code).call(application, args)
    Function(`with (this) { return ${script.committed_code} }`).call(UserAPI, args)
}