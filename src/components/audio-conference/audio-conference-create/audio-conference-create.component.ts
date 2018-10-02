import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {IvrService} from '../../../services/ivr.service';
import {FadeAnimation} from '../../../shared/fade-animation';
import {RefsServices} from '../../../services/refs.services';

@Component({
    selector: 'pbx-audio-conference-create',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    animations: [FadeAnimation('300ms')]
})

export class AudioConferenceCreateComponent implements OnInit {

    id: number;
    loading: number;
    saving: number;
    numbers = [];
    selectedNumber;

    tab: any;
    languages: any[];

    constructor(public service: IvrService,
                private refs: RefsServices,
                private activatedRoute: ActivatedRoute,
                private router: Router) {
        this.id = this.activatedRoute.snapshot.params.id;
        this.id = 0;
        this.loading = 0;
        this.saving = 0;

        this.tab = {
            items: [
                'General',
                'Members',
                'Statistic'
            ],
            select: 'General'
        };
        this.languages = [
            {
                'name': 'ru'
            }
        ];
    }

    selectTab(text: string): void {
        this.tab.select = text;
    }

    save() {
        this.saving++;
        this.service.save(this.id).then(() => {
            this.saving--;
            this.cancel();
        }).catch(() => {
            this.saving--;
        });
    }

    cancel() {
        this.router.navigate(['cabinet', 'ivr']);
    }

    addLevel() {

    }

    getItem() {
        this.loading++;
        this.service.getById(this.id).then(() => {
            this.selectedNumber = this.service.item.sip;
            this.loading--;
        }).catch(() => {
            this.loading--;
        });
    }

    getSipOuters() {
        this.loading++;
        this.refs.getSipOuters().then(res => {
            this.numbers = res;
            this.loading--;
        }).catch(err => {
            this.loading--;
        });
    }

    ngOnInit() {
        this.service.reset();
        if (this.id) {
            this.getItem();
        } else {

        }
        this.getSipOuters();
    }


}
