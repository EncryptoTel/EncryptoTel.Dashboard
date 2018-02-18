import {Type} from 'class-transformer';

import {PhoneNumberModel} from './phone-number.model';

export class DBPhoneNumberModel {
  public id: number;
  @Type(() => PhoneNumberModel)
  public phone_number: PhoneNumberModel;
  public exts: number;
  public online: number;
}
