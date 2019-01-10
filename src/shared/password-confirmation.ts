import {FormGroup} from '@angular/forms';

export function passwordConfirmation(group: FormGroup) {
    const confirmPass = group.get('password_confirmation');
    if ((confirmPass.dirty || confirmPass.touched) && !confirmPass.errors) {
        const result = group.get('password').value !== confirmPass.value;
        return !result ? null : { 'mismatch': true };
    }
    else {
        return null;
    }
    
}
