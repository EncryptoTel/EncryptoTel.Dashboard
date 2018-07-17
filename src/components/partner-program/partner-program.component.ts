import {Component, OnInit} from '@angular/core';
import {PartnerProgramService} from '../../services/partner-program.service';
import {PartnerProgramModel} from '../../models/partner-program.model';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {PageInfoModel} from '../../models/base.model';

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
    pageInfo: PageInfoModel = {page: 1, visible: true, pageCount: null, itemsCount: null, limit: 20};
    form;
    items: PartnerProgramModel;
    tags: PartnerProgramModel;

    constructor(private service: PartnerProgramService) {

    }

    selectTab(text: string): void {
        if (text !== this.tab.select) {
        this.tab.select = text;
        }
    }

    clickWithdrawFunds() {

    }

    clickTransferToAccount() {

    }

    getItems(event = null) {
        if (!event || event.loading) {this.loading++; }
        this.service.getItems(this.pageInfo).then(res => {
            if (this.pageInfo.page > res.totalPages) {
                this.pageInfo.page = res.totalPages;
                this.service.getItems(this.pageInfo).then(rez => {
                    this.pageInfo.visible = (this.pageInfo.itemsCount = res.totalCount ) > 10;
                    this.pageInfo.pageCount = res.totalPages;
                    this.items = rez.items;
                });
            } else {
                this.pageInfo.visible = (this.pageInfo.itemsCount = res.totalCount ) > 10;
                this.pageInfo.pageCount = res.totalPages;
                this.items = res.items;
            }
            if (!event || event.loading) {this.loading--; }
        }).catch(() => {
            if (!event || event.loading) {this.loading--; }
        });
    }

    getTags(event = null) {
        if (!event || event.loading) {this.loading++; }
        this.service.getItems({page: 1, limit: 999, pageCount: null, itemsCount: null, visible: null}).then(res => {
            this.tags = res.items;
            this.loading--;
        }).catch(() => {
          if (!event || event.loading) {this.loading--; }
        });
    }

    ngOnInit(): void {
        this.getItems();
        this.getTags();
    }

}
