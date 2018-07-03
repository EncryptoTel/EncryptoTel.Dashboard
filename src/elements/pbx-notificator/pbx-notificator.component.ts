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
  qu = [];
  test = 0;
  notificatorWidth: number;

  constructor() {
    this.notificatorWidth = (window.innerWidth - 616);
  }

  ngOnInit() {
    // this.example();
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
    // this.test++;
    // this.qu.push(this.test);
    // setTimeout(this.func, 5000);
    // this.notificator = changes.notificator.currentValue;

    // if (this.notificator) {
    //   const timout = setTimeout(() => {
    //     this.notificator.visible = false;
    //   }, 4000);
    // }
    this.example(changes);
  }

  timerF() {
    if (typeof this.queue !== 'undefined') {
      const shift = this.queue.shift();
      // this.queue[0].notificator.visible = false;
      if (this.queue[0]) {
        this.queue[0].notificator.visible = true;
        this.queue[0].notificator.timer = setTimeout(this.timerF, 2000);
      }

    }
  }

  func() {
     const s = this.qu.shift();
    alert( s );
    if (this.qu.length > 0) {
      setTimeout(this.func, 5000);
    }
  }

   example(changes: SimpleChanges) {
    function func() {
      if (typeof this.qu !== 'undefined') {
        const shift = this.qu.shift();
        shift.visible = false;
        if (this.qu[0]) {
          this.qu[0].visible = true;
          this.qu[0].timer = setTimeout(this.timerF, 2000);
        }
      }
    }

    function start(ch: SimpleChanges) {
      this.qu.push(ch.notificator.currentValue);
      setTimeout(func, 5000);
    }

    start(changes);
  }

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
