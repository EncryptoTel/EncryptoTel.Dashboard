export class SecretsModel {
  constructor(
    public access_token: string,
    public expires_in: string,
    public refresh_token: string,
    public token_type: string
  ) {}
}
