import {FormGroup, FormArray} from '@angular/forms';

export function redirectToExtensionValidator(formGroup: FormGroup) {
    // ...[1-101][2-nnn][1-101][1-101][1-102][1-102] => [3, 5]

    let actions = <FormArray>formGroup.get('ruleActions');
    if (actions && actions.length > 1) {
        let context = [];
        for (let i = 0; i < actions.length; i ++) {
            let actionId = actions.get([i, 'action']).value;
            let parameter = actions.get([i, 'parameter']).value;
            context.push({ 
                action: actionId, 
                parameter: parameter 
            });
        }

        let duplicates = [];
        for (let i = 1; i < context.length; i ++) {
            if (context[i].action == 1 && context[i - 1].action == 1 && context[i].parameter == context[i - 1].parameter)
                duplicates.push(i);
        }

        duplicates.forEach(idx => actions.get([idx, 'parameter']).setErrors({ 'duplicated': true }));

        return { 
            ruleActions: { 
                valid: false, 
                controls: duplicates 
        }};
    }
    return null;
}
