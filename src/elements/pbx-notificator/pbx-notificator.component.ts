import {Component, HostListener, OnInit} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {NotificatorServices} from '../../services/notificator.services';

@Component({
  selector: 'pbx-notificator',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('notificator', '400ms')]
})

export class NotificatorComponent implements OnInit {
  notificator: {
    visible: boolean,
    type: string,
    message: string
  };

  // notificator: object;

  queue = [];

  // curState: any;

  notificatorWidth: number;

  constructor(
    private service: NotificatorServices
  ) {
    this.notificatorWidth = (window.innerWidth - 616);
  }

  ngOnInit() {
    this.service.notification().subscribe(notification => {
      if (notification) {
        this.notificator = notification;
        setTimeout(() => { this.notificator.visible = false; }, 4000);
      }
    });
  }

  notificatorAction() {
    this.notificator.visible = false;
  }

  @HostListener('window:resize', ['$event'])

  onResize(event) {
    this.notificatorWidth = (window.innerWidth - 616);
  }

}
