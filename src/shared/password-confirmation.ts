import {FormGroup} from '@angular/forms';

export function passwordConfirmation(g: FormGroup) {
    const confirmPass = g.get('password_confirmation')
    if(confirmPass.dirty || confirmPass.touched) {
        const res = g.get('password').value !== confirmPass.value
        if(res) {
            confirmPass.setErrors({ 'mismatch': true })
        }
        return !res ? null : { 'mismatch': true };
    } else {
        return null;
    }
    
}
