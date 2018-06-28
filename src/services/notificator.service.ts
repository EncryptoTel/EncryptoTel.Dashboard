import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class WarningServices {
  private notificatorText = new Subject<string>();
  // private errorText = new Subject<string>();
  warning(): Observable<string> {
    return this.notificatorText.asObservable();
  }
  // error(): Observable<string> {
  //   return this.errorText.asObservable();
  // }
  setNotification(text: string) {
    this.notificatorText.next(text);
    setTimeout(() => {
      this.notificatorText.next();
    }, 3000);
  }
  // setError(text:string) {
  //   this.errorText.next(text);
  //   setTimeout(() => {
  //     this.errorText.next()
  //   }, 3000)
  // }
}
