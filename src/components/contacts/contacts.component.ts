import {Component, OnDestroy, OnInit} from '@angular/core';
import {WsServices} from '../../services/ws.services';
import {LoggerServices} from '../../services/logger.services';
import {ChatModel, MessageModel} from '../../models/chat.model';
import {Subscription} from 'rxjs/Subscription';
import {UserServices} from '../../services/user.services';
import {ContactState} from '@services/state/contact.service';

@Component({
    selector: 'pbx-contacts',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class ContactsComponent implements OnInit, OnDestroy {

    messages: MessageModel[] = [];
    chats: ChatModel[] = [];
    message: string = '';
    messagesSubscription: Subscription;
    chatsSubscription: Subscription;
    selected: number = 0;
    currentUserId: number;
    createStatus: boolean = false;
    callMenuDropdown: boolean = false;
    inviteMenuDropdown: boolean = false;
    isContactNotificationOn: boolean = true;

    constructor(private socket: WsServices,
                private logger: LoggerServices,
                private _user: UserServices,
                public contactState: ContactState) {
        let tmpUser: any;
        tmpUser = this._user.fetchUser();
        this.currentUserId = tmpUser.profile.id;
        // this.logger.log('chat create', null);
        this.messagesSubscription = this.socket.subMessages().subscribe(messages => {
            // this.logger.log('subMessages', messages)
            this.updateMessages(messages);
        });
        this.chatsSubscription = this.socket.subChats().subscribe(chats => {
            this.updateChats(chats);
        });
    }

    addContact() {
        console.log('add contact');
        this.contactState.value = {state: true};
        this.contactState.change.emit(this.contactState.value);
    }

    changeContactNotification() {
        this.isContactNotificationOn = !this.isContactNotificationOn;
    }

    showInviteMenu() {
        this.inviteMenuDropdown = !this.inviteMenuDropdown;
    }

    showCallMenu() {
        this.callMenuDropdown = !this.callMenuDropdown;
    }

    changeCreateStatus() {
        this.createStatus = !this.createStatus;
    }

    updateMessages(messages: MessageModel[]) {
        this.messages = messages;
    }

    updateChats(chats: ChatModel[]) {
        this.chats = chats;
    }

    onMessageKeyUp(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            this.sendMessage();
        }
    }

    sendMessage() {
        if (this.chats.length === 0) {
            return;
        }
        // let message = new MessageModel();
        // message.chatId = this.chatId;
        // message.text = this.message;
        // message.created = new Date().getTime();
        // this.messages.push(message);
        this.socket.sendMessage(this.chats[this.selected].id, this.message);
        this.message = '';
    }

    getStatus(message: MessageModel): number {
        if (!message.my && !message.statusUpdated && message.status < 3) {
            message.statusUpdated = true;
            this.socket.readMessage(message.id);
        }
        return message.status;
    }

    ngOnInit() {
        // this.logger.log('chat init', null);
        this.updateMessages(this.socket.messages);
        this.updateChats(this.socket.chats);
    }

    ngOnDestroy() {
        // this.logger.log('chat destroy', null);
        this.messagesSubscription.unsubscribe();
        this.chatsSubscription.unsubscribe();
    }

}
