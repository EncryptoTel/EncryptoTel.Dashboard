import {Component, OnInit} from '@angular/core';
import {MessageServices} from '../services/message.services';

import {MessageModel} from '../models/message.model';
import {animate, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'main-view',
  templateUrl: 'main-view.template.html',
  animations: [
    trigger('Fade', [
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate('.3s ease-in', style({opacity: 1}))
      ]),
      transition(':leave', [
        style({
          opacity: 1
        }),
        animate('.3s ease-out', style({opacity: 0}))
      ])
    ])
  ]
})

export class MainViewComponent implements OnInit {
  constructor(public _services: MessageServices) {}
  messagesList: MessageModel[];
  ngOnInit() {
    this._services.messagesList().subscribe(messages => {
      this.messagesList = messages;
    });
  }
}
