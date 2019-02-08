import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { HttpClient } from '@angular/common/http';
import { interval } from 'rxjs/observable/interval';
import { timeout } from 'rxjs/operators';

@Injectable()
export class ConnectionService {
    availebleConnection: Subject<boolean> = new Subject<boolean>();
    validateTimer = interval (5000);
    constructor(private http: HttpClient) {
        this.validateTimer.subscribe((r) => {
            this.ping();
        });
    }

    ping() {
        // this.http.get('/front-api/v1/internet/ping').pipe(
        //     timeout(2000)
        // ).subscribe(() => {
        //     this.availebleConnection.next(false);
        // }, () => {
        //     this.availebleConnection.next(true);
        // });
    }
}
