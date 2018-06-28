import {ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, HostListener, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges} from '@angular/core';
import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
  selector: 'pbx-notificator',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [SwipeAnimation('y','400ms')]
})

export class NotificatorComponent implements OnInit, OnChanges {
  @Input() show;
  @Input() notificator: {
    visible: boolean,
    type: string,
    message: string,
    actionType: string,
    actionName: string
  };

  timer: any;

  notificatorWidth: number;

  constructor() {
    this.notificatorWidth = (window.innerWidth - 616);
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    // console.log(changes.notificator.currentValue.visible);
    console.log(changes);
    if (changes.notificator.currentValue.visible === true) {
      this.timer = setTimeout(() => {
        this.notificator.visible = false;
      }, 4000);
    }
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
