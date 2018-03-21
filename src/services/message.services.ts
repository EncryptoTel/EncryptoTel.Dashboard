import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

import {MessageModel} from '../models/message.model';
import {LoggerServices} from './logger.services';

import {environment as _env} from '../environments/environment';

/*
  Messages services. Writing and deleting messages (errors etc.)
*/

@Injectable()
export class MessageServices {
  constructor(private logger: LoggerServices) {}
  messages: MessageModel[] = [];
  messagesSubscription: Subject<MessageModel[]> = new Subject<MessageModel[]>();
  /*
    Message ID generation
   */
  generateId(): number {
    if (this.messages.length === 0) {
      return 0;
    } else if (this.messages[0].id > 1) {
      return this.messages[0].id - 1;
    } else {
      return this.messages[this.messages.length - 1].id + 1;
    }
  }
  /*
    Message processing. Accepted params:
    Message: (id: number, type: string (error/warning/success), text: string) - message details
   */
  messageProcess(message: MessageModel): void {
    this.messages.push(message);
    this.messagesSubscription.next(this.messages);
    this.removeMessage(message.id);
    this.logger.log('Message processing details', message);
  }
  /*
    Message removing after timeout. Accepted params:
    ID: number - message ID
   */
  removeMessage(id: number): void {
    setTimeout(() => {
      this.messages.map((item, index) => {
        if (item.id === id) {
          this.messages.splice(index, 1);
        }
      });
      this.messagesSubscription.next(this.messages);
    }, _env.params.messageDuration);
  }
  /*
    Message instant removing. Accepted params:
    ID: number - message ID
   */
  instantRemove(id: number): void {
    this.messages.map((item, index) => {
      if (item.id === id) {
        this.messages.splice(index, 1);
      }
    });
    this.messagesSubscription.next(this.messages);
  }
  /*
    Error message writing. Accepted params:
    Text: string - message text
   */
  writeError(text: string): void {
    const message: MessageModel = new MessageModel(this.generateId(), 'error', text);
    this.messageProcess(message);
  }
  /*
    Warning message writing. Accepted params:
    Text: string - message text
   */
  writeWarning(text: string): void {
    const message: MessageModel = new MessageModel(this.generateId(), 'warning', text);
    this.messageProcess(message);
  }
  /*
    Success message writing. Accepted params:
    Text: string - message text
   */
  writeSuccess(text: string): void {
    const message: MessageModel = new MessageModel(this.generateId(), 'success', text);
    this.messageProcess(message);
  }
  /*
    Message list fetching for subscribe
   */
  messagesList(): Observable<MessageModel[]> {
    return this.messagesSubscription.asObservable();
  }
}
