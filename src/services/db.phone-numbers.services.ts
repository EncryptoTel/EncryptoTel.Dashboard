import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {LocalStorageServices} from './local-storage.services';
import {DBPhoneNumberModel} from '../models/db.phone-number.model';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {plainToClass} from 'class-transformer';

@Injectable()
export class DBPhoneNumbersServices {
  constructor(private _req: RequestServices,
              private _storage: LocalStorageServices) {}
  numbers: DBPhoneNumberModel[];
  subscription: Subject<DBPhoneNumberModel[]> = new Subject<DBPhoneNumberModel[]>();
  /*
    Fetch account phone numbers list
   */
  fetchNumbersList(): Promise<DBPhoneNumberModel[]> {
    return this._req.get('db_numbers.json').then(res => {
      this.numbers = plainToClass(DBPhoneNumberModel, res['numbers']);
      this._storage.writeItem('pbx_numbers', this.numbers);
      return Promise.resolve(this.numbers);
    });
  }
  /*
    Fetch if phone numbers list exist in storage
   */
  fetchNumbers = (): DBPhoneNumberModel[] | null => {
    if (this._storage.readItem('pbx_numbers')) {
      return plainToClass(DBPhoneNumberModel, this._storage.readItem('pbx_numbers'));
    } else {
      return null;
    }
  }
  /*
    Refresh phone numbers list subscription
   */
  touchNumbers(): void {
    this.numbers = this.fetchNumbers();
    this.subscription.next(this.numbers);
  }
  /*
    Phone numbers list subscription
   */
  numbersSubscription(): Observable<DBPhoneNumberModel[]> {
    return this.subscription.asObservable();
  }
}
