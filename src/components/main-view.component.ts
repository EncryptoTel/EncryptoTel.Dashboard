import {Component, HostBinding, OnInit} from '@angular/core';

import {MessageServices} from '../services/message.services';

import {MessageModel} from '../models/message.model';

import {FadeAnimation} from '../shared/fade-animation';

@Component({
  selector: 'main-view',
  templateUrl: './main-view.template.html',
  animations: [FadeAnimation('.3s')]
})

export class MainViewComponent implements OnInit {
  constructor(public _services: MessageServices) {}
  messagesList: MessageModel[];
  @HostBinding('class') public userTheme: string;
  public setUserTheme(theme: string) {
    this.userTheme = theme;
  }
  ngOnInit() {
    this.setUserTheme('dark_theme');
    this._services.messagesList().subscribe(messages => {
      this.messagesList = messages;
    });
  }
}
