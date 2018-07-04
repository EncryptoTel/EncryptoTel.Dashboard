import {Component, OnInit} from '@angular/core';
import {WsServices} from '../../services/ws.services';
import {LoggerServices} from "../../services/logger.services";

@Component({
    selector: 'pbx-chat',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class ChatComponent implements OnInit {

    messages = [];
    message: string = '';
    chatId: number = 1;

    constructor (private socket: WsServices,
                 private logger: LoggerServices) {

    }

    onMessageKeyUp(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    sendMessage() {
        this.socket.sendMessage(this.chatId, this.message);
        this.message = '';
    }

    ngOnInit() {

    }

}
