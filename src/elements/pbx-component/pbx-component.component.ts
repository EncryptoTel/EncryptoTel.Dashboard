import {Component} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {SwipeAnimation} from "../../shared/swipe-animation";

@Component({
    selector: 'pbx-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [
        SwipeAnimation('x', '300ms'),
        FadeAnimation('300ms')
    ]
})

export class BaseComponent {

}
