import {animate, style, transition, trigger} from '@angular/animations';

export function SwipeAnimation(axis: 'x' | 'y' | 'notificator' | 'player', time: string) {
  switch (axis) {
    case 'x': {
      return trigger('Swipe', [
        transition(':enter', [
          style({
            width: 0
          }),
          animate(`${time} ease-in-out`)
        ]),
        transition(':leave', [
          animate(`${time} ease-in-out`, style({width: 0}))
        ])
      ]);
    }
    case 'y': {
      return trigger('Swipe', [
        transition(':enter', [
          style({height: 0}),
          animate(`${time} ease-in-out`)
        ]),
        transition(':leave', [
          animate(`${time} ease-in-out`, style({height: 0})
          )
        ])
      ]);
    }
    case 'notificator': {
      return trigger('Swipe', [
        transition(':enter', [
          style({
            height: 0,
            transform: 'translateY(-50px)',
            opacity: 0
          }),
          animate(`${time} ease-in-out`)
        ]),
        transition(':leave', [
          animate(`${time} ease-in-out`,
            style({
              height: 0,
              transform: 'translateY(-50px)',
              opacity: 0

            })
          )
        ])
      ]);
    }
    default: {
      break;
    }
  }
}
