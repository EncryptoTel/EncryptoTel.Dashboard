import {Component} from '@angular/core';

import {FadeAnimation} from '../../shared/fade-animation';

@Component({
  selector: 'pbx-call-rules',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class CallRulesComponent {

}
