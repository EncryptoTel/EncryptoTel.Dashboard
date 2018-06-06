import {Component, OnInit} from '@angular/core';

import {FadeAnimation} from '../../../shared/fade-animation';
import {CallRulesServices} from '../../../services/call-rules.services';

@Component({
  selector: 'pbx-call-rules-create',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class CallRulesCreateComponent implements OnInit {
  numbers;

  constructor(private service: CallRulesServices) {
  }

  private getNumbers() {
    this.service.getNumbers().then(res => {
      this.numbers = res.items;
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit() {
    this.getNumbers();
  }
}
