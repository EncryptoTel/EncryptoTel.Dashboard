import {Component, Input, OnInit} from '@angular/core';

@Component({
    selector: 'reports-partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
})

export class ReportsPartnerProgramComponent implements OnInit {
    @Input() form: any;

    constructor() {

    }

    ngOnInit(): void {

    }

}
