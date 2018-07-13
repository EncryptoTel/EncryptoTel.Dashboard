import { trigger, state, style, transition, animate } from '@angular/animations';

export const PlayerAnimation = trigger('PlayerAnimation', [
  state('min', style({
    width: 0
  })),
  state('max', style({
    width: 175
  })),
  transition('min <=> max', animate('400ms ease-in'))
]);
