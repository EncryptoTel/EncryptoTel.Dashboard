import {Component} from '@angular/core';
import {WsServices} from '../../services/ws.services';

@Component({
    selector: 'pbx-chat',
    templateUrl: './template.html',
    styleUrls: ['./local.sass']
})

export class ChatComponent {

    constructor (private _ws: WsServices) {

    }

}
