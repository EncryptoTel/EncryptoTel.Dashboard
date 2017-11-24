import {FormGroup} from '@angular/forms';

export function passwordConfirmation(g: FormGroup) {
  return g.get('password').value === g.get('password_confirmation').value
    ? null : {'mismatch': true};
}
