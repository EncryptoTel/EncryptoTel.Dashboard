import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {forEach} from '@angular/router/src/utils/collection';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

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


  // queue: Observable<any>;

  notificatorWidth: number;

  constructor() {
    this.notificatorWidth = (window.innerWidth - 616);
    // this.queue.toArray().subscribe(q => {
    //   console.log(q);
    // });
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {

    if (this.notificator) {
      this.notificator = changes.notificator.currentValue;
      // this.queue.next(this.notificator);
      // // console.log(this.queue);
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
