import {Component, HostListener, OnInit} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {Subscription} from "rxjs/Subscription";
import {MessageModel} from "../../models/message.model";
import {MessageServices} from "../../services/message.services";
import {LoggerServices} from "../../services/logger.services";
import {NotificationModel} from "../../models/notification.model";

@Component({
    selector: 'pbx-notificator',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [SwipeAnimation('notificator', '400ms')]
})

export class NotificatorComponent implements OnInit {

    messageSubscription: Subscription;
    queue = [];
    notificatorWidth: number;
    timeout1 = 0;
    timeout2 = 0;
    visible = false;

    constructor(private message: MessageServices,
                private logger: LoggerServices) {
        this.onResize();
    }

    ngOnInit() {
        this.messageSubscription = this.message.subMessages().subscribe((message: MessageModel) => {
            const notification = new NotificationModel(true, message.type, message.text);
            // this.logger.log('subMessages', notification);
            this.queue.push(notification);
            this.setTimer();
        });
    }

    setTimer() {
        clearTimeout(this.timeout1);
        clearTimeout(this.timeout2);
        if (this.queue.length === 0) {
            return;
        }
        this.timeout1 = setTimeout(() => {
            this.visible = true;
            this.timeout2 = setTimeout(() => {
                this.close();
            }, 3000);
        }, 100);
    }

    close() {
        this.visible = false;
        this.queue.splice(0, 1);
        this.setTimer();
    }

    @HostListener('window:resize', [])
    onResize() {
        this.notificatorWidth = (window.innerWidth - 616);
        // this.logger.log('onResize', this.notificatorWidth);
    }

}
