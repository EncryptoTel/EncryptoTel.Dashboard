import {Component, ElementRef, OnDestroy, OnInit, ViewChild, ViewChildren} from '@angular/core';
import {WsServices} from '../../services/ws.services';
import {LoggerServices} from '../../services/logger.services';
import {ChatModel, MessageModel} from '../../models/chat.model';
import {Subscription} from 'rxjs/Subscription';
import {UserServices} from '../../services/user.services';
import {SelectService} from '@services/state/select.service';

@Component({
    selector: 'pbx-chat',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class ChatComponent implements OnInit, OnDestroy {

    messages: MessageModel[] = [];
    chats: ChatModel[] = [];
    message: string = '';
    groupName: string = '';
    messagesSubscription: Subscription;
    chatsSubscription: Subscription;
    selected: number = 0;
    currentUserId: number;
    createStatus: boolean = false;
    chatObjects: any;
    chatMessages: any;
    groupInfoContacts: any;
    dropdownSettingsStatus: any;
    dropdownSettingsUserChat: boolean = false;
    dropdownFilesStatus: boolean = false;
    dropdownSettingsGroupStatus: boolean = false;
    chatGroupName: boolean = false;
    listOfChats: boolean = true;
    addedUser: boolean = false;
    countOfAddedUsers: number = 0;
    groupInfoNotification: boolean = true;
    groupInfo: boolean = false;
    @ViewChildren('menu_block') menu: ElementRef[];

    constructor(private socket: WsServices,
                private logger: LoggerServices,
                private _user: UserServices,
                private stateService: SelectService) {
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


        this.chatObjects = [
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 1500,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 234,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 78,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 4,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 1500,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 234,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 78,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 4,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 1500,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 234,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 78,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 4,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 1500,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 234,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 78,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 4,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 1500,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 234,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 78,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 4,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 1500,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 234,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. This is a group message la-la-la',
                lastMessageTime: '10:03',
                countUnread: 78,
                isGroup: true,
                userName: '',
                titleGroup: 'Just a cool group'
            },
            {
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                lastMessageTime: '13:57',
                countUnread: 4,
                isGroup: false,
                userName: 'Adam Smith',
                titleGroup: ''
            }
        ];
        this.chatMessages = [
            {
                userName: 'Adam Smith',
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                status: false
            },
            {
                userName: 'Albert Cool',
                lastMessage: 'Hello. This is a message from me. Enjoy it!',
                status: false
            },
            {
                userName: 'John Does',
                lastMessage: 'Hi! I\'m going to tell you some cool stories!',
                status: false
            },
            {
                userName: 'Adam Smith',
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                status: false
            },
            {
                userName: 'Albert Cool',
                lastMessage: 'Hello. This is a message from me. Enjoy it!',
                status: false
            },
            {
                userName: 'John Does',
                lastMessage: 'Hi! I\'m going to tell you some cool stories!',
                status: false
            },
            {
                userName: 'Adam Smith',
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                status: false
            },
            {
                userName: 'Albert Cool',
                lastMessage: 'Hello. This is a message from me. Enjoy it!',
                status: false
            },
            {
                userName: 'John Does',
                lastMessage: 'Hi! I\'m going to tell you some cool stories!',
                status: false
            },
            {
                userName: 'Adam Smith',
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                status: false
            },
            {
                userName: 'Albert Cool',
                lastMessage: 'Hello. This is a message from me. Enjoy it!',
                status: false
            },
            {
                userName: 'John Does',
                lastMessage: 'Hi! I\'m going to tell you some cool stories!',
                status: false
            },
            {
                userName: 'Adam Smith',
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                status: false
            },
            {
                userName: 'Albert Cool',
                lastMessage: 'Hello. This is a message from me. Enjoy it!',
                status: false
            },
            {
                userName: 'John Does',
                lastMessage: 'Hi! I\'m going to tell you some cool stories!',
                status: false
            },
            {
                userName: 'Adam Smith',
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                status: false
            },
            {
                userName: 'Albert Cool',
                lastMessage: 'Hello. This is a message from me. Enjoy it!',
                status: false
            },
            {
                userName: 'John Does',
                lastMessage: 'Hi! I\'m going to tell you some cool stories!',
                status: false
            },
            {
                userName: 'Adam Smith',
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                status: false
            },
            {
                userName: 'Albert Cool',
                lastMessage: 'Hello. This is a message from me. Enjoy it!',
                status: false
            },
            {
                userName: 'John Does',
                lastMessage: 'Hi! I\'m going to tell you some cool stories!',
                status: false
            },
            {
                userName: 'Adam Smith',
                lastMessage: 'Hello. If a curator called Mona Lisa tell me',
                status: false
            },
            {
                userName: 'Albert Cool',
                lastMessage: 'Hello. This is a message from me. Enjoy it!',
                status: false
            },
            {
                userName: 'John Does',
                lastMessage: 'Hi! I\'m going to tell you some cool stories!',
                status: false
            }


        ];
        this.groupInfoContacts = [
            {
                userName: 'Adam Smith',
                lastTimeOnline: '',
                isAdmin: true,
                isOnline: true
            },
            {
                userName: 'John Does',
                lastTimeOnline: 'last seen 1 minute ago',
                isAdmin: true,
                isOnline: false
            },
            {
                userName: 'Albert Brown',
                lastTimeOnline: '',
                isAdmin: false,
                isOnline: true
            },
            {
                userName: 'Albert Brown',
                lastTimeOnline: 'last seen yesterday at 19:23',
                isAdmin: false,
                isOnline: false
            },
            {
                userName: 'Albert Brown',
                lastTimeOnline: '',
                isAdmin: false,
                isOnline: true
            },
            {
                userName: 'Albert Brown',
                lastTimeOnline: '',
                isAdmin: false,
                isOnline: true
            },
            {
                userName: 'Albert Brown',
                lastTimeOnline: '',
                isAdmin: false,
                isOnline: true
            },
            {
                userName: 'Albert Brown',
                lastTimeOnline: '',
                isAdmin: false,
                isOnline: true
            },
            {
                userName: 'Albert Brown',
                lastTimeOnline: '',
                isAdmin: false,
                isOnline: true
            }
        ];

        this.dropdownSettingsStatus = [];
        this.chatObjects.forEach(item => {
            this.dropdownSettingsStatus.push(false);
        });
    }

    getGroupInfo() {
        this.groupInfo = !this.groupInfo;
    }

    groupInfoChangeNotification() {
        this.groupInfoNotification = !this.groupInfoNotification;
    }

    countAddedUsers() {
        let count = 0;
        for (let i = 0; i < this.chatMessages.length; i++) {
            if (this.chatMessages[i].status) count++;
        }
        this.countOfAddedUsers = count;
    }

    addUserToGroup(i) {
        this.chatMessages[i].status = !this.chatMessages[i].status;
        this.countAddedUsers();
    }

    clickOutside(index): void {
        this.dropdownSettingsStatus[index] = false;
    }

    dropdownSettingsGroup() {
        this.dropdownSettingsGroupStatus = !this.dropdownSettingsGroupStatus;
    }

    acceptGroupName() {
        this.chatGroupName = !this.chatGroupName;
    }

    createNewGroup() {
        this.chatGroupName = false;
        this.listOfChats = !this.listOfChats;
    }

    changeCreateStatus() {
        this.createStatus = !this.createStatus;
    }

    changeSettingsUserChat() {
        this.dropdownSettingsUserChat = !this.dropdownSettingsUserChat;
    }

    dropdownFilesFunc() {
        this.dropdownFilesStatus = !this.dropdownFilesStatus;
    }

    dropdownSettings($event, index) {

        //  расчет для вывода меню в верхнем положении

        let scrolling = (document.querySelector('pbx-chat .list_of_chats .items').scrollTop) * 1;
        let visibleHeight = parseInt(window.getComputedStyle(document.querySelector('pbx-chat .list_of_chats .items'), null).getPropertyValue('height')) + scrolling;
        let itemHeight = parseInt(window.getComputedStyle(document.querySelector('pbx-chat .list_of_chats .items .item'), null).getPropertyValue('height'));
        let itemMarginBottom = parseInt(window.getComputedStyle(document.querySelector('pbx-chat .list_of_chats .items .item'), null).getPropertyValue('margin-bottom'));
        let totalItemHeight = itemHeight + itemMarginBottom;
        let countVisible = (visibleHeight - (visibleHeight % totalItemHeight)) / totalItemHeight;
        let dropdownTop = 'dropdownTop';

        function settingClass () {
            for (let k = 0; k < document.querySelectorAll('pbx-chat .list_of_chats .items .item').length; k++) {
                document.querySelectorAll('pbx-chat .list_of_chats .items .item')[k].classList.remove(dropdownTop);
            }

            document.querySelectorAll('pbx-chat .list_of_chats .items .item')[countVisible - 1].classList.add(dropdownTop);
            document.querySelectorAll('pbx-chat .list_of_chats .items .item')[countVisible - 2].classList.add(dropdownTop);
            document.querySelectorAll('pbx-chat .list_of_chats .items .item')[countVisible - 3].classList.add(dropdownTop);
            document.querySelectorAll('pbx-chat .list_of_chats .items .item')[countVisible - 4].classList.add(dropdownTop);

            if (countVisible < document.querySelectorAll('pbx-chat .list_of_chats .items .item').length) {
                document.querySelectorAll('pbx-chat .list_of_chats .items .item')[countVisible].classList.add(dropdownTop);
            }

        }

        settingClass();

        //////////////////////////////////////////////

        for (let i in this.dropdownSettingsStatus) {
            if (parseInt(i) !== index) {
                this.dropdownSettingsStatus[i] = false;
            }
        }
        this.dropdownSettingsStatus[index] = !this.dropdownSettingsStatus[index];
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
        this.stateService.change.subscribe(isOpen => {
            if (isOpen) {
                // this.dropdownSettingsStatus = !isOpen;
            }
        });
    }

    ngOnDestroy() {
        // this.logger.log('chat destroy', null);
        this.messagesSubscription.unsubscribe();
        this.chatsSubscription.unsubscribe();
    }

}
