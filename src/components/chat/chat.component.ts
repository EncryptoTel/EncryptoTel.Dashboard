import {Component, OnDestroy, OnInit} from '@angular/core';
import {WsServices} from '../../services/ws.services';
import {LoggerServices} from "../../services/logger.services";
import {MessageModel} from "../../models/chat.model";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'pbx-chat',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class ChatComponent implements OnInit, OnDestroy {

    messages: MessageModel[] = [];
    message: string = '';
    chatId: number = 1;
    messagesSubscription: Subscription;

    constructor (private socket: WsServices,
                 private logger: LoggerServices) {
        this.logger.log('chat create', null);
        this.messagesSubscription = this.socket.subMessages().subscribe(messages => {
            this.messages = messages;
        });
    }

    onMessageKeyUp(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    sendMessage() {
        // let message = new MessageModel();
        // message.chatId = this.chatId;
        // message.text = this.message;
        // message.created = new Date().getTime();
        // this.messages.push(message);
        this.socket.sendMessage(this.chatId, this.message);
        this.message = '';
    }

    ngOnInit() {
        this.logger.log('chat init', null);
        this.messages = this.socket.messages;
    }

    ngOnDestroy() {
        this.logger.log('chat destroy', null);
        this.messagesSubscription.unsubscribe();
    }

}
