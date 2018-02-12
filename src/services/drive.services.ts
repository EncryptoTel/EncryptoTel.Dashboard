import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {StorageServices} from './storage.services';
import {Subject} from 'rxjs/Subject';
import {DriveModel} from '../models/drive.model';
import {LoggerServices} from './logger.services';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class DriveServices {
  constructor(private _req: RequestServices,
              private _storage: StorageServices,
              private logger: LoggerServices) {}
  drive: DriveModel;
  subscription: Subject<DriveModel> = new Subject<DriveModel>();
  /*
    Fetch account storage params
   */
  fetchStorageParams(): Promise<DriveModel> {
    return this._req.get('db_drive.json').then(res => {
      this.drive = res['drive'];
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
    const drive = this._storage.readItem('pbx_drive');
    drive[param] = value;
    drive.available = drive.total - drive.used;
    this.logger.log(`Drive after '${param}' changing to '${value}'`, drive);
    this._storage.writeItem('pbx_drive', drive);
    this.touchStorage();
  }
  /*
    Fetch if drive exist in storage
   */
  fetchStorage = (): DriveModel => {
    return this._storage.readItem('pbx_drive');
  }
  /*
    Refresh drive subscription
   */
  touchStorage(): void {
    this.drive = this._storage.readItem('pbx_drive');
    this.subscription.next(this.drive);
  }
  /*
    Drive subscription
   */
  storageSubscription(): Observable<DriveModel> {
    return this.subscription.asObservable();
  }
}
