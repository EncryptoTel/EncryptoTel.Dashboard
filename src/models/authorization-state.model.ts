export class AuthorizationStateModel {
  constructor(
    public twoFactorStatus: boolean = false,
    public twoFactorCode: string = '',
    public error: string = ''
  ) {}
}
