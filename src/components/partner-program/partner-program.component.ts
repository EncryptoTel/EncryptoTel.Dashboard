import {Component, OnInit} from '@angular/core';
import {PartnerProgramService} from '../../services/partner-program.service';
import {PartnerProgramItem, PartnerProgramModel} from '../../models/partner-program.model';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {SidebarButtonItem, SidebarInfoItem, SidebarInfoModel} from "../../models/base.model";
import {ClipboardService} from "ngx-clipboard";
import {MessageServices} from "../../services/message.services";

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
    sidebar = new SidebarInfoModel();
    selected: PartnerProgramItem;

    constructor(public service: PartnerProgramService,
                private _clipboard: ClipboardService,
                private _message: MessageServices) {

    }

    selectTab(text: string): void {
        this.tab.select = text;
    }

    clickWithdrawFunds() {

    }

    clickTransferToAccount() {

    }

    select(item: PartnerProgramItem) {
        this.selected = item;
        this.sidebar.mode = 'view';

        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Close', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(2, 'Edit', 'success'));

        this.sidebar.items = [];
        this.sidebar.items.push(new SidebarInfoItem(4, 'Name', this.selected.name));
        this.sidebar.items.push(new SidebarInfoItem(5, 'Status', this.selected.statusName));
        this.sidebar.items.push(new SidebarInfoItem(6, 'Link', this.selected.refLinkUrl));
        this.sidebar.items.push(new SidebarInfoItem(7, 'Copy Link to Clipboard', this.selected, true, false, true, 'white'));
    }

    edit(item: PartnerProgramItem) {
        this.selected = item.id ? new PartnerProgramItem(item) : item;
        this.sidebar.mode = 'edit';

        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Close', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(3, 'Save', 'success'));

        this.sidebar.items = [];

        let option = new SidebarInfoItem(4, 'Name', this.selected, false, true);
        option.key = 'name';
        this.sidebar.items.push(option);

        if (item.id) {
            option = new SidebarInfoItem(4, 'Enabled', this.selected, false, true);
            option.key = 'status';
            option.checkbox = true;
            this.sidebar.items.push(option);
        }

    }

    click(item) {
        switch (item.id) {
            case 1:
                this.selected = null;
                break;
            case 2:
                this.edit(this.selected);
                break;
            case 3:
                // console.log(this.selected);
                this.save(this.selected);
                break;
            case 7:
                this.copyToClipboard(this.selected);
                break;
        }
    }

    save(item: PartnerProgramItem) {
        if (!item.id) {
            // item = new PartnerProgramItem();
            this.partners.items.push(item);
        }
        this.partners.items.map(partner => {
            if (item.id === partner.id) partner.loading++;
        });
        this.service.save(item.id, item.name, item.status).then(res => {
            this.getItems(item);
            this.selected = null;
            this.partners.items.map(partner => {
                if (item.id === partner.id) partner.loading--;
            });
        }).catch(() => {
            this.partners.items.map(partner => {
                if (item.id === partner.id) partner.loading--;
            });
        });
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

    copyToClipboard(item: PartnerProgramItem): void {
        if (this._clipboard.copyFromContent(item.refLinkUrl)) {
            this._message.writeSuccess('Link has been copied to clipboard');
        }
    }

    // copyToClipboard(value: string): Promise<boolean> {
    //     let promise = new Promise<boolean>((resolve, reject): void => {
    //         let textarea = null;
    //         try {
    //             textarea = document.createElement('textarea');
    //             textarea.style.height = '0px';
    //             textarea.style.left = '-100px';
    //             textarea.style.opacity = '0';
    //             textarea.style.position = 'fixed';
    //             textarea.style.top = '-100px';
    //             textarea.style.width = '0px';
    //             document.body.appendChild(textarea);
    
    //             textarea.value = value;
    //             textarea.select();
    //             document.execCommand('copy');

    //             resolve(true);
    //         }
    //         finally {
    //             if (textarea && textarea.parentNode) {
    //                 textarea.parentNode.removeChild(textarea);
    //             }
    //         }
    //     });
    //     return promise;
    // }

    ngOnInit(): void {
        this.getItems();
    }

}
