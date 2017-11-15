export class SignUpFormModel {
  constructor(
    public name: string,
    public surname: string,
    public email: string,
    public password: string,
    public password_confirmation: string
  ) {}
}
