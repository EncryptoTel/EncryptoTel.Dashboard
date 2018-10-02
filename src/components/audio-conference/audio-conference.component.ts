import {Component} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';
import {AudioConferenceService} from '../../services/audio-conference.service';

@Component({
    selector: 'pbx-ivr',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class AudioConferenceComponent {

    table = {
        titles: ['Name', 'Status', 'Description'],
        keys: ['name', 'statusName', 'description']
    };

    constructor(private service: AudioConferenceService) {

    }


}
