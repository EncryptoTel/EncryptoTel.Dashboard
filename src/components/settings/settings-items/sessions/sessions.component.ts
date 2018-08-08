import {AnimationComponent} from "../../../../shared/shared.functions";
import {BaseComponent} from "../../../../elements/pbx-component/pbx-component.component";
import {OnInit} from "@angular/core";
import {SessionsModel} from "../../../../models/settings.models";
import {ButtonItem, TableInfoExModel, TableInfoItem} from "../../../../models/base.model";
import {SessionsService} from "../../../../services/sessions.service";
import {Router} from "@angular/router";

@AnimationComponent({
    selector: 'profile-component',
    templateUrl: './template.html',
    styleUrls: ['../local.sass'],
    providers: [SessionsService]
})

export class SessionsComponent extends BaseComponent implements OnInit {

    sessions: SessionsModel = new SessionsModel();
    table: TableInfoExModel = new TableInfoExModel();
    buttons: ButtonItem[] = [];

    constructor(public service: SessionsService,
                private router: Router) {
        super();
        this.table.items.push(new TableInfoItem('Session', 'session'));
        this.table.items.push(new TableInfoItem('IP', 'ip'));
        this.table.items.push(new TableInfoItem('Country', 'country'));
        this.table.items.push(new TableInfoItem('Expires At', 'displayExpires'));
        this.table.items.push(new TableInfoItem('Active', 'active', null, 80));
        // this.table.items.push(new TableInfoItem('User Agent', 'userAgent'));
        this.buttons.push(new ButtonItem(0, 'Back', 'cancel', true));
    }

    back() {
        this.router.navigate(['cabinet', 'settings']);
    }

    ngOnInit() {

    }

}
