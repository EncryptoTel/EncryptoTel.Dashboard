import {animate, style, transition, trigger} from '@angular/animations';

export function  FadeAnimation(time: string) {
  return trigger('Fade', [
    transition(':enter', [
      style({
        opacity: 0
      }),
      animate(`${time} ease-in`, style({opacity: 1}))
    ]),
    transition(':leave', [
      style({
        opacity: 1
      }),
      animate(`${time} ease-out`, style({opacity: 0}))
    ])
  ]);
}
