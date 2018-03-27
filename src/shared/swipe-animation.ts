import {animate, style, transition, trigger} from '@angular/animations';

export function SwipeAnimation(axis: 'x' | 'y', time: string) {
  switch (axis) {
    case 'x': {
      return trigger('Swipe', [
        transition(':enter', [
          style({
            width: 0
          }),
          animate(`${time} ease-in`)
        ]),
        transition(':leave', [
          animate(`${time} ease-out`, style({width: 0}))
        ])
      ]);
    }
    case 'y': {
      return trigger('Swipe', [
        transition(':enter', [
          style({
            height: 0
          }),
          animate(`${time} ease-in`)
        ]),
        transition(':leave', [
          animate(`${time} ease-out`, style({height: 0}))
        ])
      ]);
    }
    default: {
      break;
    }
  }
}
