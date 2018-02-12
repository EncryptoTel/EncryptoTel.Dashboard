import {Injectable} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';

import {RequestServices} from './request.services';
import {LoggerServices} from './logger.services';
import {StorageServices} from './storage.services';
import {ListServices} from './list.services';

import {BalanceModel} from '../models/balance.model';

/*
  User services. Authentication, user params changing etc.
*/

@Injectable()
export class BalanceServices {
  constructor(private _req: RequestServices,
              private _storage: StorageServices,
              private _list: ListServices,
              private logger: LoggerServices) {}
  balance: BalanceModel;
  subscription: Subject<BalanceModel> = new Subject<BalanceModel>();
  /*
    Fetch account balance params
   */
  fetchBalanceParams(): Promise<BalanceModel> {
    return this._req.get('db_balance.json').then(res => {
      this.balance = res['balance'];
      return this._list.fetchCurrenciesList().then(list => {
        this.balance['symbol'] = list.find(currency => {
          return currency.id === res['balance']['currency_id'];
        })['symbol'];
        this._storage.writeItem('pbx_balance', this.balance);
        this.touchBalance();
        return Promise.resolve(this.balance);
      });
    });
  }
  /*
    Fetch if balance exist in storage
   */
  fetchBalance = (): BalanceModel => {
    return this._storage.readItem('pbx_balance');
  }
  /*
    Update balance without additional request
   */
  updateBalance(balance: number): void {
    this.balance = this._storage.readItem('balance');
    this.balance['balance'] = balance;
    this._storage.writeItem('pbx_balance', this.balance);
    this.touchBalance();
  }
  /*
    Refresh balance subscription
   */
  touchBalance(): void {
    this.balance = this._storage.readItem('pbx_balance');
    this.subscription.next(this.balance);
  }
  /*
    Balance subscription
   */
  balanceSubscription(): Observable<BalanceModel> {
    return this.subscription.asObservable();
  }
}
