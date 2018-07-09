import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FadeAnimation} from '../../shared/fade-animation';
import {RingGroupsServices} from '../../services/ring-groups.service';
import {RingGroupsListItem} from '../../models/ring-groups.model';

@Component({
  selector: 'ring-groups-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class RingGroupsComponent {
  constructor(private _service: RingGroupsServices,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.getRingGroups();
  }

  loading = true;
  queues: RingGroupsListItem[] = [];

  tableInfo = {
    titles: ['Queue Name', 'Phone Number', 'Ring Strategy', 'Ring Time'],
    keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout']
  };

  edit(queue: RingGroupsListItem): void {
    this.router.navigate(['edit', queue.id], {relativeTo: this.activatedRoute});
  }

  delete(queue): void {
    this.loading = true;
    this._service.delete(queue.id).then(() => {
      this.getRingGroups();
    }).catch(err => {
      console.error(err);
    });
  }

  private getRingGroups(): void {
    this._service.getRingGroups().then(res => {
      if (res.hasOwnProperty('items')) {
        this.queues = res.items;
        this.loading = false;
      }
    }).catch(err => {
      console.error(err);
      this.loading = false;
    });
  }
}
