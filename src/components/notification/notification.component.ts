import {Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import {WsServices} from '../../services/ws.services';
import {LoggerServices} from '../../services/logger.services';
import {ChatModel, MessageModel} from '../../models/chat.model';
import {Subscription} from 'rxjs/Subscription';
import {UserServices} from '../../services/user.services';
import {StorageItem} from '@models/storage.model';
import {Subject} from 'rxjs/Subject';

@Component({
    selector: 'pbx-notification',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class NotificationComponent implements OnInit, OnDestroy {

    messages: MessageModel[] = [];
    chats: ChatModel[] = [];
    message: string = '';
    messagesSubscription: Subscription;
    chatsSubscription: Subscription;
    selected: number = 0;
    currentUserId: number;
    public countUnread: number = 0;
    notificationObjects: any;

    storageItem: StorageItem;
    storageItemUpdate: Subject<StorageItem> = new Subject<StorageItem>();

    constructor(private socket: WsServices,
                private logger: LoggerServices,
                private _user: UserServices) {
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
        this.notificationObjects = [
            {
                date: '20.01.2018',
                items: [
                    {
                        message: 'Успешно куплен номер телефона <span>+7 (658) 874 68 98</span>',
                        status: 0,
                        time: ''
                    },
                    {
                        message: 'Успешно куплен номер телефона <span>+7 (658) 874 68 98</span>',
                        status: 0,
                        time: ''
                    }
                ]
            },
            {
                date: '19.01.2018',
                items: [
                    {
                        message: 'Успешно куплен номер телефона <span>+7 (658) 874 68 98</span>',
                        status: 0,
                        time: ''
                    },
                    {
                        message: 'Успешно куплен номер телефона <span>+7 (658) 874 68 98</span>',
                        status: 0,
                        time: ''
                    }
                ]
            },
            {
                date: '18.01.2018',
                items: [
                    {
                        message: 'Успешно куплен номер телефона <span>+7 (658) 874 68 98</span>',
                        status: 0,
                        time: ''
                    },
                    {
                        message: 'Успешно куплен номер телефона <span>+7 (658) 874 68 98</span>',
                        status: 0,
                        time: ''
                    }
                ]
            }
        ];

        this.notificationObjects.forEach(notification => {
            notification.items.forEach(item => {
                if (item.status === 0) {
                    this.countUnread++;
                }
            });
        });
    }

    changeNotificationStatus(i, j) {
        this.notificationObjects[i].items[j].status = !this.notificationObjects[i].items[j].status;
        if (this.notificationObjects[i].items[j].status === 1) {
            this.countUnread--;
        } else {
            this.countUnread++;
        }
        // this.messageStatus = !this.messageStatus;
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
