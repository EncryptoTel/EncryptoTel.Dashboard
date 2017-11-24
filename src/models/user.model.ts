import {SecretsModel} from './secrets.model';

export class UserModel {
  constructor(
    public secrets: SecretsModel
  ) {}
}
