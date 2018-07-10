// import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {Component, HostListener, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {Observable} from 'rxjs/Observable';
import {NotificatorServices} from '../../services/notificator.services';
import {log} from 'util';

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
        // console.log(`NOTIFICATION WHICH GOT FROM SERVICE`, notification);
        this.notificator = notification;
        setTimeout(() => { this.notificator.visible = false; }, 2000);
      }
    });
  }

  notificatorAction() {
    this.notificator.visible = false;
  }

  @HostListener('window:resize', ['$event'])

  onResize(event) {
    console.log('Width: ' + event.target.innerWidth);
    this.notificatorWidth = (window.innerWidth - 616);
  }

}
