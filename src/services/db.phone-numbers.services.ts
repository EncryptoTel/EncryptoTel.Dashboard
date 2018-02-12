import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {StorageServices} from './storage.services';

@Injectable()
export class DBPhoneNumbersServices {
  constructor(private _req: RequestServices,
              private _storage: StorageServices) {}
}
