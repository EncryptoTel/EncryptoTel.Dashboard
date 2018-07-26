import {Component, OnInit} from '@angular/core';
import {PartnerProgramService} from '../../services/partner-program.service';
import {PartnerProgramModel} from '../../models/partner-program.model';
import {SwipeAnimation} from '../../shared/swipe-animation';

@Component({
    selector: 'partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PartnerProgramService],
    animations: [SwipeAnimation('x', '300ms')]
})

export class PartnerProgramComponent implements OnInit {

    loading = 0;
    tab = {
        items: [
            'Overview',
            'Links',
            'Reports',
            'Terms and Conditions'
        ],
        select: 'Overview'
    };
    form;
    partners: PartnerProgramModel = new PartnerProgramModel();

    constructor(private service: PartnerProgramService) {

    }

    selectTab(text: string): void {
        this.tab.select = text;
    }

    clickWithdrawFunds() {

    }

    clickTransferToAccount() {

    }

    getItems(event = null) {
        (event ? event : this).loading++;
        this.service.getItems(this.partners).then(res => {
            this.partners = res;
            (event ? event : this).loading--;
        }).catch(() => {
            (event ? event : this).loading--;
        });
    }

    ngOnInit(): void {
        this.getItems();
    }

}
