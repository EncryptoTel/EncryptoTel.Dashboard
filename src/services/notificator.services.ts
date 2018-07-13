import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { NotificatorModel } from '../models/notificator.model';

@Injectable()
export class NotificatorServices {

  private notificator = new Subject<NotificatorModel>();
  private queue = [];
  private input = [];

  constructor () {
    this.qHandler();
  }

  /*
  * QUEUE INPUT
  */
  setNotification(noti) {
    this.input.push(noti);
  }

  /*
  * QUEUE HANDLER
  */
  private qHandler() {
    setInterval(() => {
      // console.log(this.input);
      this.queue = this.input;
      if (this.queue.length > 0) {
        this.notificator.next(this.queue.shift());
      }
    }, 4000);
  }

  /*
  * QUEUE OUTPUT
  */
  notification(): Observable<NotificatorModel> {
    return this.notificator.asObservable();
  }

}
