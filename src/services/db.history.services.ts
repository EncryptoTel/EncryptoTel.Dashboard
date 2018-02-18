import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {StorageServices} from './storage.services';
import {DBHistoryItem, DBHistoryModel} from '../models/db.history.model';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {plainToClass} from 'class-transformer';
import {dateComparison} from '../shared/shared.functions';

@Injectable()
export class DBHistoryServices {
  constructor(private _req: RequestServices,
              private _storage: StorageServices) {}
  history: DBHistoryModel[];
  subscription: Subject<DBHistoryModel[]> = new Subject<DBHistoryModel[]>();
  fetchHistoryList(): Promise<DBHistoryModel[]> {
    return this._req.get('db_history.json').then(res => {
      const list = plainToClass(DBHistoryItem, res['history']);
      const dates: string[] = [];
      list.forEach(item => {
        const date = new Date(item.date);
        const dateObj = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('.');
        if (dates.indexOf(dateObj) === -1) {
          dates.push(dateObj);
        } else { return; }
      });
      this.history = [];
      dates.forEach(date => {
        this.history.push(plainToClass(DBHistoryModel, {
          date: new Date(date),
          list: []
        }));
      });
      list.map(item => {
        this.history.find(historyItem => {
          return dateComparison(historyItem.date, new Date(item.date));
        }).list.push(plainToClass(DBHistoryItem, item));
      });
      this._storage.writeItem('pbx_history', this.history);
      this.touchHistory();
      return Promise.resolve(this.history);
    });
  }
  fetchHistory(): DBHistoryModel[] | null {
    if (this._storage.readItem('pbx_history')) {
      return plainToClass(DBHistoryModel, this._storage.readItem('pbx_history'));
    } else {
      return null;
    }
  }
  touchHistory(): void {
    this.history = this.fetchHistory();
    this.subscription.next(this.history);
  }
  historySubscription(): Observable<DBHistoryModel[]> {
    return this.subscription.asObservable();
  }
}
