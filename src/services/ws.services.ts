import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import {Subject} from "rxjs/Subject";
import {BalanceWsModel} from "../models/balance.model";
import {Observable} from "rxjs/Observable";



@Injectable()
export class WsServices {

    balance: BalanceWsModel;
    subscription: Subject<BalanceWsModel> = new Subject<BalanceWsModel>();

    constructor(private socket: Socket) {
        this.balance = {balance: 0};
    }


    connect(token: string) {
        let socket = this.socket;
        let _this = this;
        socket.on('connect', function(){
            socket.emit('authenticate', {token: token});

            socket.on('channels', function (data) {
                socket.emit('subscribe-to-channel', {channel: data.channel});
            });
        });

        socket.on('eventClient', function (data) {
            console.log(data);
        });

        socket.on('balance', function (data) {
            _this.balance.balance = JSON.parse(data).balance;
            _this.subscription.next(_this.balance);
            console.log('balance', data);
        });
        socket.on('notification', function (data) {
            console.log('notification', data);
        });

    }

    getBalance(): Observable<BalanceWsModel> {
        return this.subscription.asObservable();
    }

}