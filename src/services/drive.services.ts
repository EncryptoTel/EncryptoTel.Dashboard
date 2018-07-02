import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {LocalStorageServices} from './local-storage.services';
import {Subject} from 'rxjs/Subject';
import {DriveModel} from '../models/drive.model';
import {LoggerServices} from './logger.services';
import {Observable} from 'rxjs/Observable';
import {plainToClass} from 'class-transformer';

@Injectable()
export class DriveServices {
  constructor(private _req: RequestServices,
              private _storage: LocalStorageServices,
              private logger: LoggerServices) {}
  drive: DriveModel;
  subscription: Subject<DriveModel> = new Subject<DriveModel>();
  /*
    Fetch account storage params
   */
  fetchStorageParams(): Promise<DriveModel> {
    return this._req.get('db_drive.json').then(res => {
      this.drive = plainToClass(DriveModel, res['drive'] as Object);
      this.drive.available = this.drive.total - this.drive.used;
      this._storage.writeItem('pbx_drive', this.drive);
      this.touchStorage();
      return Promise.resolve(this.drive);
    });
  }
  /*
    Changing drive param
   */
  changeStorageParam(param: 'used' | 'total', value: number): void {
    this.drive = this.fetchStorage();
    if (this.drive) {
      this.drive[param] = value;
      this.drive.available = this.drive.total - this.drive.used;
      this.logger.log(`Drive after '${param}' changing to '${value}'`, this.drive);
      this._storage.writeItem('pbx_drive', this.drive);
      this.touchStorage();
    }
  }
  /*
    Fetch if drive exist in storage
   */
  fetchStorage = (): DriveModel | null => {
    if (this._storage.readItem('pbx_drive')) {
      return plainToClass(DriveModel, this._storage.readItem('pbx_drive') as Object);
    } else {
      return null;
    }
  }
  /*
    Refresh drive subscription
   */
  touchStorage(): void {
    this.drive = this.fetchStorage();
    this.subscription.next(this.drive);
  }
  /*
    Drive subscription
   */
  storageSubscription(): Observable<DriveModel> {
    return this.subscription.asObservable();
  }
}
