import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FadeAnimation} from '../../shared/fade-animation';
import {RingGroupService} from '../../services/ring-group.service';
import {RingGroupItem, RingGroupModel} from "../../models/ring-group.model";
import {plainToClass} from "class-transformer";

@Component({
    selector: 'ring-groups-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class RingGroupsComponent implements OnInit {

    pageInfo: RingGroupModel = new RingGroupModel();

    loading: number = 0;

    table = {
        titles: ['Queue Name', 'Phone Number', 'Ring Strategy', 'Ring Time'],
        keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout']
    };


    constructor(private service: RingGroupService,
                private router: Router) {
    }

    edit(item: RingGroupItem): void {
        this.router.navigate(['cabinet', 'ring-groups', `${item.id}`]);
    }

    delete(item: RingGroupItem): void {
        this.service.beginLoading(item);
        this.service.deleteById(item.id).then(() => {
            this.getItems(item);
            this.service.endLoading(item);
        }).catch(err => {
            this.service.endLoading(item);
        });
    }


    getItems(item = null): void {
        this.service.beginLoading(item ? item : this);
        this.service.getItems(this.pageInfo).then((res: RingGroupModel) => {
            this.pageInfo = plainToClass(RingGroupModel, res);
            this.service.endLoading(item ? item : this);
        }).catch(err => {
            this.service.endLoading(item ? item : this);
        });
    }

    ngOnInit() {
        this.getItems();
    }

}
