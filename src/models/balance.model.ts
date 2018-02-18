export class BalanceModel {
  constructor(
    public currency_id: number,
    public balance: number,
    public ett: number,
    public symbol?: string
  ) {}
}
