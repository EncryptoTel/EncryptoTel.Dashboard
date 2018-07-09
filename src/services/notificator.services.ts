import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import {NotificatorModel} from '../models/notificator.model';

@Injectable()
export class NotificatorServices {

  constructor() {}

  private notificator = new Subject<NotificatorModel>();
  private queue = [];
  private currentNoification: any;

  /*
  * QUEUE INPUT
  */
  setNotification(noti) {
    // this.queue.push(noti);
    // this.currentNoification = this.queue.shift();
    this.notificator.next(noti);

  }

  /*
 * QUEUE HANDLER
 */
  private qHandler() {

  }

  /*
  * QUEUE OUTPUT
  */
  notification(): Observable<NotificatorModel> {
    return this.notificator.asObservable();
  }

}
