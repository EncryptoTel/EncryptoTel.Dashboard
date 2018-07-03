import {Injectable} from '@angular/core';
import {Socket} from 'ng-socket-io';
import {Subject} from "rxjs/Subject";
import {BalanceModel, ServiceModel} from "../models/ws.model";
import {Observable} from "rxjs/Observable";
import {delay} from "rxjs/operators";


@Injectable()
export class WsServices {

    balance: BalanceModel;
    balanceSubscription: Subject<BalanceModel> = new Subject<BalanceModel>();

    service: ServiceModel;
    serviceSubscription: Subject<ServiceModel> = new Subject<ServiceModel>();

    constructor(private socket: Socket) {
        this.balance = {balance: 0};
        this.service = {id: null};
    }


    connect(token: string) {
        const socket = this.socket;
        const _this = this;
        socket.on('connect', function (data) {
            console.log('connect', data);
            socket.emit('authenticate', {token: token});
        });

        socket.on('channels', function (data) {
            console.log('channels', data);
            socket.emit('subscribe-to-channel', {channel: data.channel});
        });

        socket.on('eventClient', function (data) {
            console.log('eventClient', data);
        });

        socket.on('balance', function (data) {
            console.log('balance', data);
            _this.balance.balance = JSON.parse(data).balance;
            _this.balanceSubscription.next(_this.balance);
        });

        socket.on('service', function (data) {
            console.log('service', data);
            _this.service.id = JSON.parse(data).id;
            _this.serviceSubscription.next(_this.service);
        });

        socket.on('notification', function (data) {
            console.log('notification', data);
        });

        socket.on('close', function (data) {
            console.log('CLOSE');
        });

    }

    getBalance(): Observable<BalanceModel> {
        return this.balanceSubscription.asObservable();
    }

    getService(): Observable<ServiceModel> {
        return this.serviceSubscription.asObservable();
    }

}
