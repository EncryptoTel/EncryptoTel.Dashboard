export class DBTariffPlanModel {
  constructor(
    public id: number,
    public title: string,
    public price: number,
    public payment_date: Date
  ) {}
}
