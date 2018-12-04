import {
    Component,
    OnDestroy,
    OnInit,
    ViewChild,
    ElementRef
} from '@angular/core';
import { WsServices } from '../../services/ws.services';
import { LoggerServices } from '../../services/logger.services';
import { ChatModel, MessageModel } from '../../models/chat.model';
import { Subscription } from 'rxjs/Subscription';
import { UserServices } from '../../services/user.services';
import { CallService } from '@services/call.server';
import * as SIP from 'sip.js/dist/sip';

@Component({
    selector: 'pbx-call',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})
export class CallComponent implements OnInit, OnDestroy {
    messages: MessageModel[] = [];
    chats: ChatModel[] = [];
    message: string = '';
    messagesSubscription: Subscription;
    chatsSubscription: Subscription;
    selected: number = 0;
    currentUserId: number;
    // call methods
    userAgent = new SIP.UA({
        uri: '1000@195.201.176.216',
        transportOptions: {
            wsServers: ['wss://195.201.176.216:8089']
        },
        authorizationUser: '1000@195.201.176.216',
        password: '10001000'
    });

    incomingCallAudio = new Audio('assets/mp3/rington.mp3');
    remoteAudio = new Audio();
    localAudio = new Audio();
    session;
    initPhone() {
        this.incomingCallAudio.load();
        this.incomingCallAudio.loop = true;
        this.remoteAudio.autoplay = true;
        this.localAudio.autoplay = true;
        this.initHandler();
        this.userAgent.register();
    }

    initHandler() {
        this.userAgent.on('connecting', () => {
            console.log('====================================connecting');
        });

        this.userAgent.on('connected', () => {
            console.log('====================================connected');
        });

        this.userAgent.on('disconnected', () => {
            console.log('====================================disconnected');
        });

        this.userAgent.on('registered', () => {
            console.log('=====================================registered');
        });

        this.userAgent.on('unregistered', () => {
            console.log('=====================================unregistered');
        });

        this.userAgent.on('registrationFailed', () => {
            console.log(
                '=====================================registrationFailed'
            );
        });

        this.userAgent.on('invite', session => {
            this.session = session;
            this.initSessionHandler();
            console.log('=====================================invite');
        });

        this.userAgent.on('message', () => {
            console.log('=====================================message');
        });

        this.userAgent.on('outOfDialogReferRequested', () => {
            console.log(
                '=====================================outOfDialogReferRequested'
            );
        });
    }

    initSessionHandler() {
        this.session.on('trackAdded', () => {
            // We need to check the peer connection to determine which track was added

            const pc = this.session.sessionDescriptionHandler.peerConnection;

            // Gets remote tracks
            const remoteStream = new MediaStream();
            pc.getReceivers().forEach(function(receiver) {
                remoteStream.addTrack(receiver.track);
            });
            this.remoteAudio.srcObject = remoteStream;
            this.remoteAudio.play().then(val => {
                console.log(val);
            });

            // Gets local tracks
            const localStream = new MediaStream();
            pc.getSenders().forEach(function(sender) {
                localStream.addTrack(sender.track);
            });
            this.localAudio.srcObject = localStream;
            this.localAudio.play().then(val => {
                console.log(val);
            });
        });
    }

    call() {
        console.log('startCall');
        this.session = this.userAgent.invite('2000');
        console.log(this.session);
        this.initSessionHandler();
    }

    answer() {
        this.session.accept();
    }

    //////// end
    constructor(
        private socket: WsServices,
        private logger: LoggerServices,
        private _user: UserServices,
        public callService: CallService
    ) {
        let tmpUser: any;
        this.initPhone();
        tmpUser = this._user.fetchUser();
        this.currentUserId = tmpUser.profile.id;
        // this.logger.log('chat create', null);
        this.messagesSubscription = this.socket
            .subMessages()
            .subscribe(messages => {
                // this.logger.log('subMessages', messages)
                this.updateMessages(messages);
            });
        this.chatsSubscription = this.socket.subChats().subscribe(chats => {
            this.updateChats(chats);
        });
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
