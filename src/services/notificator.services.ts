import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import {NotificatorModel} from '../models/notificator.model';

@Injectable()
export class NotificatorServices {
  constructor() {}

  // public notificator = new Subject<object>();
  notificator: Subject<NotificatorModel> = new Subject<NotificatorModel>();


  // notification(): Observable<object> {
  //   return this.notificator.asObservable();
  // }

  notification(): Observable<NotificatorModel> {
    return this.notificator.asObservable();
  }


  setNotification(noti) {
    this.notificator.next(noti);
    // setTimeout(() => {
    //   this.notificator.next(noti);
    // }, 4000);
  }

}
