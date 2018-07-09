// import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {Component, HostListener, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {Observable} from 'rxjs/Observable';
import {NotificatorServices} from '../../services/notificator.services';

@Component({
  selector: 'pbx-notificator',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y', '400ms')]
})

export class NotificatorComponent implements OnInit, OnChanges {
  @Input() notificator: {
    timer: any,
    visible: boolean,
    type: string,
    message: string,
    actionType: string,
    actionName: string
  };

  notificatorOne: {
    visible: boolean,
    message: string,
    actionType: string,
    actionName: string
  };


  queue = [];


  // curState: any;

  notificatorWidth: number;

  constructor(
    private service: NotificatorServices
  ) {
    this.notificatorWidth = (window.innerWidth - 616);
    // this.queue.toArray().subscribe(q => {
    //   console.log(q);
    // });
  }

  ngOnInit() {
    this.service.notification().subscribe(text => {
      console.log(`GOT FROM SERVICE`, text);
    });
  }

  ngOnChanges(changes: SimpleChanges) {

    if (this.notificator) {
      console.log(this.notificator);
      // this.notificatorOne = changes.notificator.currentValue;
      console.log(`PASSED TO SERVICE`, changes.notificator.currentValue);
      console.log(`===================================================`);

      const curState = changes.notificator.currentValue;
      this.service.setNotification(this.notificator);

      // console.log(this.queue);
      // this.queueHandler(this.queue);

      // this.lifeTime = setTimeout(() => {
      //   this.notificator.visible = false;
      // }, 4000);
    }


  }


  notificatorAction() {
    // this.notificator.visible = false;
    // clearTimeout(this.timer);
  }

  @HostListener('window:resize', ['$event'])

  onResize(event) {
    console.log('Width: ' + event.target.innerWidth);
    this.notificatorWidth = (window.innerWidth - 616);
  }

}
