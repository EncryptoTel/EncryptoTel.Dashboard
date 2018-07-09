import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'overview-partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})

export class OverviewPartnerProgramComponent implements OnInit {
    @Input() form: any;

    constructor() {

    }

    ngOnInit(): void {

    }

}
