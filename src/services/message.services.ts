import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {MessageModel} from '../models/message.model';
import {LoggerServices} from './logger.services';

@Injectable()
export class MessageServices {
    constructor(private logger: LoggerServices) {
    }

    id = 0;
    messageSubscription: Subject<MessageModel> = new Subject<MessageModel>();

    private generateId(): number {
        this.id++;
        return this.id;
    }

    private messageProcess(type, text: string, time = null): void {
        const message: MessageModel = new MessageModel(this.generateId(), type, text, time);
        // this.messages.push(message);
        this.messageSubscription.next(message);
        // this.removeMessage(message.id);
        this.logger.log('Message processing details', message);
    }

    // removeMessage(id: number): void {
    //     setTimeout(() => {
    //         this.messages.map((item, index) => {
    //             if (item.id === id) {
    //                 this.messages.splice(index, 1);
    //             }
    //         });
    //         this.messagesSubscription.next(this.messages);
    //     }, _env.params.messageDuration);
    // }

    // instantRemove(id: number): void {
    //     this.messages.map((item, index) => {
    //         if (item.id === id) {
    //             this.messages.splice(index, 1);
    //         }
    //     });
    //     this.messagesSubscription.next(this.messages);
    // }

    writeError(text: string, time = null): void {
        this.messageProcess('error', text, time);
    }

    // writeWarning(text: string): void {
    //     this.messageProcess('warning', text);
    // }

    writeSuccess(text: string): void {
        this.messageProcess('success', text);
    }

    subMessages(): Observable<MessageModel> {
        return this.messageSubscription.asObservable();
    }
}
