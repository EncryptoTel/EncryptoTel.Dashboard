import {FormGroup, FormArray, ValidatorFn, AbstractControl} from '@angular/forms';

export function redirectToExtensionValidator(control: FormGroup): { [key: string]: any } | null {
    // ...[1-101][2-nnn][1-101][1-101][1-102][1-102] => [3, 5]

    const actions = <FormArray>control.get('ruleActions');
    if (actions && actions.length > 1) {
        const context = [];
        for (let i = 0; i < actions.length; i ++) {
            const actionId = actions.get([i, 'action']).value;
            const parameter = actions.get([i, 'parameter']).value;
            context.push({ 
                action: actionId, 
                parameter: parameter 
            });
        }

        const duplicates = [];
        for (let i = 1; i < context.length; i ++) {
            if (context[i].action === 1 && context[i - 1].action === 1 && context[i].parameter === context[i - 1].parameter) {
                duplicates.push(i);
            }
        }

        duplicates.forEach(idx => actions.get([idx, 'parameter']).setErrors({ 'duplicated': true }));
    }
    return null;
}

export function numberRangeValidator(minVal: number, maxVal: number): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        const forbidden = (control.value < minVal || control.value > maxVal);
        return forbidden 
            ? { 'range': { value: control.value } } 
            : null;
    };
}

export function callRuleTimeValidator(control: FormGroup): { [key: string]: any } | null {
    if (typeof control.value !== 'string' || control.value === '*') {
        return null;
    }

    if (control.value.length === 0) {
        return { 'days': { value: control.value } };
    }
    return null;
}

export function durationTimeValidator(control: FormGroup): { [key: string]: any } | null {
    if (typeof control.value !== 'string' || control.value === '*') {
        return null;
    }

    const timeRange = control.value.split('-');
    
    if (timeRange.length !== 2) {
        return { 'invalidRange': { value: control.value } };
    }
    if (timeRange[0] > timeRange[1]) {
        return { 'startTime': { value: control.value } };
    }
    // if (timeRange[0] == timeRange[1]) {
    //     return { 'equalTime': { value: control.value } };
    // }

    return null;
}
