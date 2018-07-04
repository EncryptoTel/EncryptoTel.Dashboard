import {Component, OnInit} from '@angular/core';
import {WsServices} from '../../services/ws.services';
import {LoggerServices} from "../../services/logger.services";
import {MessageModel} from "../../models/chat.model";
import {Subscription} from "rxjs/Subscription";

@Component({
    selector: 'pbx-chat',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class ChatComponent implements OnInit {

    messages: MessageModel[] = [];
    message: string = '';
    chatId: number = 1;
    messagesSubscription: Subscription;

    constructor (private socket: WsServices,
                 private logger: LoggerServices) {
        this.messagesSubscription = this.socket.getMessages().subscribe(messages => {
            this.logger.log('messagesSubscription', messages);
            for (let i = 0; i < messages.length; i++) {
                this.logger.log('message', messages[i]);
                this.messages.push(messages[i]);
            }

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

    }

}
