export class DBPhoneNumberModel {
  constructor(
    public id: number,
    public country_id: number,
    public number_prefix: number,
    public number: number,
    public exts: number,
    public online: number
  ) {}
}
