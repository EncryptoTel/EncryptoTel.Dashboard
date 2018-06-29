import { Injectable } from '@angular/core';
import { Socket } from 'ng-socket-io';
import {Subject} from "rxjs/Subject";
import {BalanceModel, ServiceModel} from "../models/ws.model";
import {Observable} from "rxjs/Observable";



@Injectable()
export class WsServices {

    balance: BalanceModel;
    balanceSubscription: Subject<BalanceModel> = new Subject<BalanceModel>();

    service: ServiceModel;
    serviceSubscription: Subject<ServiceModel> = new Subject<ServiceModel>();

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
            _this.balanceSubscription.next(_this.balance);
            console.log('balance', data);
        });

        socket.on('service', function (data) {
            _this.service.id = JSON.parse(data).id;
            _this.serviceSubscription.next(_this.service);
            console.log('service', data);
        });

        socket.on('notification', function (data) {
            console.log('notification', data);
        });

      socket.on('close', function (data) {
        console.log('notification ALLOE');
      });

    }

    getBalance(): Observable<BalanceModel> {
        return this.balanceSubscription.asObservable();
    }

    getService(): Observable<ServiceModel> {
        return this.serviceSubscription.asObservable();
    }

}
