import {Component, OnInit} from '@angular/core';
import {PartnerProgramService} from '../../services/partner-program.service';
import {PartnerProgramItem, PartnerProgramModel} from '../../models/partner-program.model';
import {SwipeAnimation} from '../../shared/swipe-animation';
import {SidebarButtonItem, SidebarInfoItem, SidebarInfoModel} from '../../models/base.model';
import {ClipboardService} from 'ngx-clipboard';
import {MessageServices} from '../../services/message.services';
import {FormGroup, FormBuilder, Validators} from '../../../node_modules/@angular/forms';
import {FormBaseComponent} from '../../elements/pbx-form-base-component/pbx-form-base-component.component';
import {simpleNameRegExp} from '../../shared/vars';


@Component({
    selector: 'partner-program-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [PartnerProgramService],
    animations: [SwipeAnimation('x', '300ms')]
})
export class PartnerProgramComponent extends FormBaseComponent implements OnInit {
    partners: PartnerProgramModel;
    selected: PartnerProgramItem;
    form: FormGroup;

    tab: any;
    sidebar = new SidebarInfoModel();

    loading: number;

    // -- component lifecycle methods -----------------------------------------

    constructor(public service: PartnerProgramService,
                protected message: MessageServices,
                protected fb: FormBuilder,
                private clipboard: ClipboardService) {
        super(fb, message);

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
        super.ngOnInit();
    }

    // -- form methods --------------------------------------------------------

    initForm(): void {
        this.form = this.fb.group({
            id: [null],
            name: [null, [Validators.required, Validators.minLength(3), Validators.pattern(simpleNameRegExp)]],
            refLink: [null],
            refLinkUrl: [{value: null, disabled: true}],
            status: [null, [Validators.required]],
            totalBonus: [null],
            created: [null]
        });
    }

    // -- event handlers ------------------------------------------------------

    selectTab(text: string): void {
        this.tab.select = text;
    }

    clickWithdrawFunds() {
    }

    clickTransferToAccount() {
    }

    select(item: PartnerProgramItem) {
        console.log('select', item);
        this.selected = item;

        this.sidebar.mode = 'view';

        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Close', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(2, 'Edit', 'success'));

        this.sidebar.items = [];
        this.sidebar.items.push(new SidebarInfoItem(4, 'Name', this.selected.name));
        this.sidebar.items.push(new SidebarInfoItem(5, 'Status', this.selected.statusName));
        this.sidebar.items.push(new SidebarInfoItem(6, 'Link', this.selected.refLinkUrl));
        this.sidebar.items.push(new SidebarInfoItem(7, 'Copy Link to Clipboard', this.selected, true, false, true, 'accent'));
    }

    edit(item: PartnerProgramItem) {
        this.selected = item.id ? new PartnerProgramItem(item) : item;
        this.setFormData(this.selected, () => {
            this.form.get('refLinkUrl').setValue(this.selected.refLinkUrl);
            this.form.get('status').setValue(false);
        });

        this.sidebar.mode = 'edit';

        this.sidebar.buttons = [];
        this.sidebar.buttons.push(new SidebarButtonItem(1, 'Cancel', 'cancel'));
        this.sidebar.buttons.push(new SidebarButtonItem(3, 'Save', 'success'));

        this.sidebar.items = [];
        // TODO: is value really used?
        let editItem = new SidebarInfoItem(4, 'Name *', this.selected.name);
        editItem.init({key: 'name', object: this.form, edit: true});
        this.sidebar.items.push(editItem);

        if (this.selected.refLinkUrl) {
            editItem = new SidebarInfoItem(6, 'Link', this.selected.refLinkUrl);
            editItem.init({key: 'refLinkUrl', object: this.form, edit: true, disabled: true});
            this.sidebar.items.push(editItem);
        }

        let statusOptions = [
            {title: 'Enabled', value: true, id: 1},
            {title: 'Disabled', value: false, id: 0}
        ];
        editItem = new SidebarInfoItem(5, 'Status', null);
        editItem.init({key: 'status', object: this.form, options: statusOptions, optionsKey: 'value'});
        this.sidebar.items.push(editItem);
    }

    click(item: SidebarButtonItem): void {
        switch (item.id) {
            case 1:
                this.close(!!this.selected.id, () => this.confirmClose());
                break;
            case 2:
                this.edit(this.selected);
                break;
            case 3:
                this.save(this.selected);
                break;
            case 7:
                this.copyToClipboard(this.selected);
                break;
        }
    }

    confirmClose(): void {
        this.resetForms();
        this.selected = null;
    }

    selectItemStatus(item: any): void {
        this.selected.status = item.value;
    }

    copyToClipboard(item: PartnerProgramItem): void {
        if (this.clipboard.copyFromContent(item.refLinkUrl)) {
            this.message.writeSuccess('Link has been copied to clipboard');
        }
    }

    // -- data processing methods ---------------------------------------------

    save(item: PartnerProgramItem): void {
        if (!this.validateForms()) return;
        this.setModelData(item);
        item.status = (<any>item.status).value;
        console.log('save', item);

        let partner = this.partners.items.find(p => p.id === item.id);
        if (partner) partner.loading--;

        this.service.save(item.id, item.name, item.status).then(() => {
            this.getItems(item);
            this.selected = null;
        }).catch(() => {
        })
            .then(() => {
                let partner = this.partners.items.find(p => p.id === item.id);
                if (partner) partner.loading--;
            });
    }

    getItems(item: PartnerProgramItem = null): void {
        this.selected = null;
        (item ? item : this).loading++;
        this.service.getItems(this.partners).then(response => {
            this.partners = response;
            console.log('partners', this.partners);
        }).catch(() => {
        })
            .then(() => (item ? item : this).loading--);
    }
}
