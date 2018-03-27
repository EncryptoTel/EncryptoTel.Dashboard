export class SignUpFormModel {
  constructor(
    public username: string,
    public lastname: string,
    public email: string,
    public password: string,
    public password_confirmation: string
  ) {}
}
