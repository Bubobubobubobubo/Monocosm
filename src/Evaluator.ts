import type { Script } from './Types';

export const tryEvaluate = (script: Script): void => {
    let isValidCode: boolean;
    try {
        Function(script.temporary_code)()
        isValidCode = true;
    } catch (error) {
        Function(script.committed_code)()
        isValidCode = false;
    }

    if (isValidCode) {
        script.committed_code = script.temporary_code; 
    } 
}

export const evaluate = (script: Script, ...args: object[]): void => {
    Function(script.committed_code)(...args)
}