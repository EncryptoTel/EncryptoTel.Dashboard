import {Component, OnInit} from '@angular/core';
import {PartnerProgramService} from '../../services/partner-program.service';
import {PartnerProgramItem, PartnerProgramModel} from '../../models/partner-program.model';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {SidebarButtonItem, SidebarInfoItem, SidebarInfoModel} from "../../models/base.model";
import {ClipboardService} from "ngx-clipboard";
import {MessageServices} from "../../services/message.services";
import { FormGroup } from '../../../node_modules/@angular/forms';


@Component({
    selector: 'partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PartnerProgramService],
    animations: [SwipeAnimation('x', '300ms')]
})
export class PartnerProgramComponent implements OnInit {
    partners: PartnerProgramModel;
    selected: PartnerProgramItem;
    form: FormGroup;

    tab: any;
    sidebar = new SidebarInfoModel();

    loading: number;

    // -- component lifecycle methods -----------------------------------------

    constructor(public service: PartnerProgramService,
                private _clipboard: ClipboardService,
                private _message: MessageServices) {
        this.partners = new PartnerProgramModel();
        this.tab = {
            items: [
                'Overview',
                'Links',
                'Reports',
                'Terms and Conditions'
            ],
            select: 'Overview'
        };
        this.loading = 0;
    }

    ngOnInit(): void {
        this.getItems();
    }

    // -- event handlers ------------------------------------------------------

    selectTab(text: string): void {
        this.tab.select = text;
    }

    clickWithdrawFunds() {}

    clickTransferToAccount() {}

    select(item: PartnerProgramItem) {
        this.selected = item;
        this.sidebar.mode = 'view';

        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Cancel', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(2, 'Edit', 'success'));

        this.sidebar.items = [];
        this.sidebar.items.push(new SidebarInfoItem(4, 'Name', this.selected.name));
        this.sidebar.items.push(new SidebarInfoItem(5, 'Status', this.selected.statusName));
        this.sidebar.items.push(new SidebarInfoItem(6, 'Link', this.selected.refLinkUrl));
        this.sidebar.items.push(new SidebarInfoItem(7, 'Copy Link to Clipboard', this.selected, true, false, true, 'accent'));
    }

    edit(item: PartnerProgramItem) {
        console.log('edit', item);
        this.selected = item.id ? new PartnerProgramItem(item) : item;
        this.sidebar.mode = 'edit';

        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Cancel', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(3, 'Save', 'success'));

        this.sidebar.items = [];
        // TODO: is value really used?
        let editItem = new SidebarInfoItem(4, 'Name *', this.selected.name);
        editItem.init({ key: 'name', object: this.selected, edit: true });
        this.sidebar.items.push(editItem);
        
        if (this.selected.refLinkUrl) {
            editItem = new SidebarInfoItem(6, 'Link', this.selected.refLinkUrl);
            editItem.init({ key: 'refLinkUrl', object: this.selected, edit: true, disabled: true });
            this.sidebar.items.push(editItem);
        }

        let statusOptions = [
            { title: 'Active', value: true, id: 1 },
            { title: 'Disabled', value: false, id: 2 }
        ];
        let selectedStatusIndex = this.selected.status ? 0 : 1;
        editItem = new SidebarInfoItem(5, 'Status', null);
        editItem.init({ key: 'status', object: statusOptions[selectedStatusIndex], options: statusOptions });
        this.sidebar.items.push(editItem);
    }

    click(item) {
        switch (item.id) {
            case 1: this.selected = null; break;
            case 2: this.edit(this.selected); break;
            case 3: this.save(this.selected); break;
            case 7: this.copyToClipboard(this.selected); break;
        }
    }

    selectItemStatus(item: any): void {
        this.selected.status = item.value;
    }

    copyToClipboard(item: PartnerProgramItem): void {
        if (this._clipboard.copyFromContent(item.refLinkUrl)) {
            this._message.writeSuccess('Link has been copied to clipboard');
        }
    }

    // -- data processing methods ---------------------------------------------

    save(item: PartnerProgramItem): void {
        if (!item.id) {
            // item = new PartnerProgramItem();
            // this.partners.items.push(item);
        }
        
        let partner = this.partners.items.find(p => p.id === item.id);
        if (partner) partner.loading --;
        
        this.service.save(item.id, item.name, item.status).then(() => {
            this.getItems(item);
            this.selected = null;
        }).catch(() => {})
          .then(() => {
              let partner = this.partners.items.find(p => p.id === item.id);
              if (partner) partner.loading --;
          });
    }

    getItems(item: PartnerProgramItem = null): void {
        this.selected = null;
        (item ? item : this).loading ++;
        this.service.getItems(this.partners).then(response => {
            this.partners = response;
            console.log('partners', this.partners);
        }).catch(() => {})
          .then(() => (item ? item : this).loading --);
    }
}
