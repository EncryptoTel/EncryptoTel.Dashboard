import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';

import {UserServices} from '../../shared/user.services';

@Component({
  selector: 'sign-in-component',
  templateUrl: 'template.html',
  styleUrls: ['./local_styles.sass']
})

export class SignInComponent implements OnInit {
  constructor(private router: Router,
              private _services: UserServices) {}
  signInForm: FormGroup;
  inputValidation(name: string) {
    const field = this.signInForm.controls[name];
    return field.invalid && field.touched;
  }
  signIn(event) {
    event.preventDefault();
    this._services.signIn(this.signInForm.value);
  }
  ngOnInit() {
    if (this._services.fetchUser()) {
      this.router.navigateByUrl('/cabinet/');
    }
    this.signInForm = new FormGroup({
      'username': new FormControl(undefined, [
        Validators.required,
        Validators.minLength(5),
        Validators.email
      ]),
      'password': new FormControl(undefined, [
        Validators.required,
        Validators.minLength(5)
      ])
    });
  }
}
