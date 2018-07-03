import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
  selector: 'pbx-notificator',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y','400ms')]
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

  timer: any;

  queue = [];

  notificatorWidth: number;

  constructor() {
    this.notificatorWidth = (window.innerWidth - 616);
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes.notificator.currentValue.visible);
    // console.log(changes);
    // const change = changes;
    //
    // if (typeof change.notificator.currentValue !== 'undefined') {
    //   this.queue.push(change.notificator.currentValue);
    //   console.log(this.queue);
    //
    //   change.notificator.currentValue.visible = false;
    //
    //   if (this.queue.length === 1) {
    //     // change.notificator.currentValue.visible = true;
    //     // this.queue[0].visible = true;
    //     change.notificator.currentValue.timer = setTimeout(this.timerF, 2000);
    //   }
    //
    // }

    this.notificator = changes.notificator.currentValue;

    if (this.notificator) {
      const timout = setTimeout(() => {
        this.notificator.visible = false;
      }, 4000);
    }
  }

  // timerF() {
  //   if (typeof this.queue !== 'undefined') {
  //     const shift = this.queue.shift();
  //     // this.queue[0].notificator.visible = false;
  //     if (this.queue[0]) {
  //       this.queue[0].notificator.visible = true;
  //       this.queue[0].notificator.timer = setTimeout(this.timerF, 2000);
  //     }
  //     alert(shift.notificator.currentValue);
  //   }
  // }

  // example() {
  //   const qu = [];
  //
  //   function func() {
  //     const s = qu.shift();
  //     if (qu.length > 0) {
  //       setTimeout(func, 1000);
  //     }
  //     alert( s );
  //   }
  //
  //   function start() {
  //     qu.push('Hello!');
  //     qu.push('World!');
  //     qu.push('Vasya!');
  //     qu.push('Kisa!');
  //     setTimeout(func, 1000);
  //   }
  //
  //   start();
  // }

  notificatorAction() {
    this.notificator.visible = false;
    clearTimeout(this.timer);
  }

  @HostListener('window:resize', ['$event'])

  onResize(event) {
    console.log('Width: ' + event.target.innerWidth);
    this.notificatorWidth = (window.innerWidth - 616);
  }

}
