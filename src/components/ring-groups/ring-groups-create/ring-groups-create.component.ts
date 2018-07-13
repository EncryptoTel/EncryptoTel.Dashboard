import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {RingGroupService} from '../../../services/ring-group.service';
import {FadeAnimation} from '../../../shared/fade-animation';


@Component({
    selector: 'ring-groups-create-component',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class RingGroupsCreateComponent implements OnInit, OnDestroy {

    id: number = 0;
    loading: number = 0;
    saving: number = 0;

    constructor(public service: RingGroupService,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
        this.id = this.activatedRoute.snapshot.params.id;
    }

    save(): void {
        this.saving++;
        this.service.save(this.id).then(res => {
            this.saving--;
            this.cancel();
        }).catch(res => {
            this.saving--;
        });
    }

    cancel(): void {
        this.router.navigate(['cabinet', 'ring-groups']);
    }

    back(): void {
        this.router.navigate(['members'], {relativeTo: this.activatedRoute});
    }

    getItem(id: number) {
        this.loading++;
        this.service.getItem(id).then(res => {
            this.getParams();
            this.loading--;
        }).catch(err => {
            this.loading--;
        });
    }

    getParams() {
        this.loading++;
        this.service.getParams().then(res => {
            this.loading--;
        }).catch(res => {
            this.loading--;
        });
    }

    ngOnInit() {
        this.service.reset();
        this.service.editMode = this.id && this.id > 0;
        if (this.id) {
            this.getItem(this.id);
        } else {
            this.getParams();
        }
    }

    ngOnDestroy() {

    }

}
