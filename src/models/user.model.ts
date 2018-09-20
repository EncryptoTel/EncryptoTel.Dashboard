import {SecretsModel} from './secrets.model';
import {BalanceModel} from './balance.model';

export class UserModel {
  constructor(
    public secrets: SecretsModel,
    public avatar?: string,
    public profile?: ProfileModel,
    public balance?: BalanceModel
  ) {}
}

export class ProfileModel {
  constructor(
      public firstname: string,
      public lastname: string,
      public email: string
  ) {}
}
