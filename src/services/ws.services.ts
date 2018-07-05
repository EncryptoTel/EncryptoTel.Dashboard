import {Injectable} from '@angular/core';
import {Socket} from 'ng-socket-io';
import {Subject} from "rxjs/Subject";
import {BalanceModel, ServiceModel} from "../models/ws.model";
import {Observable} from "rxjs/Observable";
import {LoggerServices} from "./logger.services";
import {MessageModel} from "../models/chat.model";


@Injectable()
export class WsServices {

    balance: BalanceModel;
    balanceSubscription: Subject<BalanceModel> = new Subject<BalanceModel>();

    service: ServiceModel;
    serviceSubscription: Subject<ServiceModel> = new Subject<ServiceModel>();

    messages: MessageModel[] = [];
    messagesSubscription: Subject<MessageModel[]> = new Subject<MessageModel[]>();

    token: string = '';

    constructor(private socket: Socket,
                private logger: LoggerServices) {
        this.balance = {balance: 0};
        this.service = {id: null};

        const _this = this;
        socket.on('connect', function () {
            _this.log('<<< connect', null);
            _this.onConnect();
        });
        socket.on('channels', function (data) {
            _this.log('<<< channels', data);
            _this.onChannels(data);
        });
        socket.on('eventClient', function (data) {
            _this.log('<<< eventClient', data);
            _this.onEventClient(data);
        });
        socket.on('balance', function (data) {
            _this.log('<<< balance', data);
            _this.onBalance(data);
        });
        socket.on('service', function (data) {
            _this.log('<<< service', data);
            _this.onService(data);
        });
        socket.on('notification', function (data) {
            _this.log('<<< notification', data);
            _this.onNotification(data);
        });
        socket.on('message', function (data) {
            _this.log('<<< message', data);
            _this.onMessage(data);
        });
        socket.on('contact', function (data) {
            _this.log('<<< contact', data);
            _this.onContacts(data);
        });
        socket.on('error', function (data) {
            _this.log('<<< error', data);
            _this.onError(data);
        });
        socket.on('close', function (data) {
            _this.log('<<< close', data);
            _this.onClose(data);
        });
    }

    log(details: string, data: any) {
        // this.logger.log(details, data);
    }

    setToken(token: string) {
        if (this.token != '') {
            this.token = token;
            this.authenticate();
        } else {
            this.token = token;
        }
    }

    private onConnect() {
        this.authenticate();
    }

    private onChannels(data) {
        this.subscribe(data.channel);
        if (data.channel === 'message') {
            this.getMessages();
        }
    }

    private onEventClient(data) {
    }

    private onBalance(data) {
        this.balance.balance = JSON.parse(data).balance;
        this.balanceSubscription.next(this.balance);
    }

    private onService(data) {
        this.service.id = JSON.parse(data).id;
        this.serviceSubscription.next(this.service);
    }

    private onNotification(data) {
    }

    private onMessage(data) {
        if (typeof data === 'string') {
            data = JSON.parse(data);
        }
        let messages: MessageModel[] = data.messages;
        for (let i = 0; i < messages.length; i++) {
            let b = true;
            for (let j = 0; j < this.messages.length; j++) {
                if (this.messages[j].id === messages[i].id) {
                    b = false;
                    this.messages[j] = messages[i];
                }
            }
            if (b) {
                this.messages.push(messages[i]);
            }
        }
        this.messagesSubscription.next(this.messages);
    }

    private onContacts(data) {
    }

    private onError(data) {
    }

    private onClose(data) {
    }

    private send(eventName: string, data: any) {
        this.log(`>>> ${eventName}`, data)
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

    getMessages() {
        this.send('get-messages', {});
        return this.messages;
    }

    getContacts() {
        this.send('get-contacts', {});
    }

    getBalance(): Observable<BalanceModel> {
        return this.balanceSubscription.asObservable();
    }

    getService(): Observable<ServiceModel> {
        return this.serviceSubscription.asObservable();
    }

    subMessages(): Observable<MessageModel[]> {
        return this.messagesSubscription.asObservable();
    }

}
