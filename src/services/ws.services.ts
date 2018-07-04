import {Injectable} from '@angular/core';
import {Socket} from 'ng-socket-io';
import {Subject} from "rxjs/Subject";
import {BalanceModel, ServiceModel} from "../models/ws.model";
import {Observable} from "rxjs/Observable";
import {delay} from "rxjs/operators";
import {LoggerServices} from "./logger.services";


@Injectable()
export class WsServices {

    balance: BalanceModel;
    balanceSubscription: Subject<BalanceModel> = new Subject<BalanceModel>();

    service: ServiceModel;
    serviceSubscription: Subject<ServiceModel> = new Subject<ServiceModel>();

    token: string = '';

    constructor(private socket: Socket,
                private log: LoggerServices) {
        this.balance = {balance: 0};
        this.service = {id: null};

        const _this = this;
        socket.on('connect', function (data) {
            _this.onConnect(data);
        });
        socket.on('channels', function (data) {
            _this.onChannels(data);
        });
        socket.on('eventClient', function (data) {
            _this.onEventClient(data);
        });
        socket.on('balance', function (data) {
            _this.onBalance(data);
        });
        socket.on('service', function (data) {
            _this.onService(data);
        });
        socket.on('notification', function (data) {
            _this.onNotification(data);
        });
        socket.on('close', function (data) {
            _this.onClose(data);
        });
    }

    setToken(token: string) {
        if (this.token != '') {
            this.token = token;
            this.authenticate();
        } else {
            this.token = token;
        }
    }

    onConnect(data) {
        this.log.log('<<< connect', data);
        this.authenticate();
    }

    onChannels(data) {
        this.log.log('<<< channels', data);
        this.subscribe(data.channel);
    }

    onEventClient(data) {
        this.log.log('<<< eventClient', data);
    }

    onBalance(data) {
        this.log.log('<<< balance', data);
        this.balance.balance = JSON.parse(data).balance;
        this.balanceSubscription.next(this.balance);
    }

    onService(data) {
        this.log.log('<<< service', data);
        this.service.id = JSON.parse(data).id;
        this.serviceSubscription.next(this.service);
    }

    onNotification(data) {
        this.log.log('<<< notification', data);
    }

    onClose(data) {
        this.log.log('<<< close', data);
    }

    send(eventName: string, data: any) {
        this.log.log(`>>> ${eventName}`, data)
        this.socket.emit(eventName, data);
    }

    authenticate() {
        if (this.token) {
            this.send('authenticate', {token: this.token});
        }
    }

    subscribe(channel: string) {
        this.send('subscribe-to-channel', {channel: channel});
    }

    getBalance(): Observable<BalanceModel> {
        return this.balanceSubscription.asObservable();
    }

    getService(): Observable<ServiceModel> {
        return this.serviceSubscription.asObservable();
    }

}
