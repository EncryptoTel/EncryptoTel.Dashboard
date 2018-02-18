import {SecretsModel} from './secrets.model';

export class UserModel {
  constructor(
    public secrets: SecretsModel,
    public image?: string,
    public name?: string,
    public surname?: string
  ) {}
}
