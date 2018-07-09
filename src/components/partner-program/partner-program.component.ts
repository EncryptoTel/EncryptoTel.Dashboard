import {Component, OnInit} from '@angular/core';
import {PartnerProgramService} from "../../services/partner-program.service";
import {PageInfoModel} from "../../models/page-info.model";
import {PartnerProgramModel} from "../../models/partner-program.model";

@Component({
    selector: 'partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PartnerProgramService]
})

export class PartnerProgramComponent implements OnInit {

    loading: number = 0;
    tab = {
        items: [
            // 'Overview',
            'Links',
            // 'Reports',
            // 'Terms and Conditions'
        ],
        icons: [null, null, null, null],
        select: 'Links'
    };

    form;
    pageInfo: PartnerProgramModel;

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
        if (!event || event.loading)
            this.loading++;
        this.service.get('').then(res => {
            this.pageInfo = res;
            if (!event || event.loading)
                this.loading--;
        }).catch(res => {
            if (!event || event.loading)
                this.loading--;
        })
    }

    ngOnInit(): void {
        this.getItems();

    }

}
