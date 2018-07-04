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
                private logger: LoggerServices) {
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
        socket.on('message', function (data) {
            _this.onMessage(data);
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

    private onConnect(data) {
        this.logger.log('<<< connect', data);
        this.authenticate();
    }

    private onChannels(data) {
        this.logger.log('<<< channels', data);
        this.subscribe(data.channel);
    }

    private onEventClient(data) {
        this.logger.log('<<< eventClient', data);
    }

    private onBalance(data) {
        this.logger.log('<<< balance', data);
        this.balance.balance = JSON.parse(data).balance;
        this.balanceSubscription.next(this.balance);
    }

    private onService(data) {
        this.logger.log('<<< service', data);
        this.service.id = JSON.parse(data).id;
        this.serviceSubscription.next(this.service);
    }

    private onNotification(data) {
        this.logger.log('<<< notification', data);
    }

    private onMessage(data) {
        this.logger.log('<<< message', data);
    }

    private onClose(data) {
        this.logger.log('<<< close', data);
    }

    private send(eventName: string, data: any) {
        this.logger.log(`>>> ${eventName}`, data)
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

    sendMessage(chatId: number, message: string) {
        this.send('send-message', {body: message, chatId: chatId});
    }

    getBalance(): Observable<BalanceModel> {
        return this.balanceSubscription.asObservable();
    }

    getService(): Observable<ServiceModel> {
        return this.serviceSubscription.asObservable();
    }

}
