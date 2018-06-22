import {Type} from 'class-transformer';
import {months} from '../shared/vars';

export class TariffPlanModel {
  id: number;
  title: string;
  price: number;
  @Type(() => Date)
  payment_date: Date;
  get paymentDate(): string {
    return `${months[this.payment_date.getMonth()]}/${this.payment_date.getDate()}`;
  }
}
