import {Component} from '@angular/core';
import {QueuesListItem} from '../../models/queue.model';
import {CallQueueService} from '../../services/call-queue.service';
import {ActivatedRoute, Router} from '@angular/router';
import {FadeAnimation} from '../../shared/fade-animation';

@Component({
  selector: 'pbx-call-queues',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class CallQueuesComponent {
  constructor(private _service: CallQueueService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.getQueues();
  }

  loading = true;
  queues: QueuesListItem[] = [];
  data = [];
  keys = ['name', 'phone', 'strategy', 'timeout', 'description'];
  tableInfo = {
    titles: ['Queue Name', 'Phone Number', 'Ring Strategy', 'Ring Time', 'Description'],
    keys: ['name', 'sip.phoneNumber', 'strategyName', 'timeout', 'description']
  };
  modal = {
    visible: false,
    confirm: {type: 'error', value: 'Delete'},
    decline: {type: 'cancel', value: 'Cancel'}
  };
  pick;
  pageInfo = {
    page: 1,
    limit: 10,
    total: null
  };


  edit(queue: QueuesListItem): void {
    this.router.navigate(['edit', queue.id], {relativeTo: this.activatedRoute});
  }

  delete(queue): void {
    this.loading = true;
    this._service.delete(queue.id).then(() => {
      this.getQueues();
    }).catch(err => {
      console.error(err);
    });
  }

  fillData() {
    this.data = [];
    for (let i = 0; i < this.queues.length; i++) {
      this.data.push({
        id: this.queues[i].id,
        name: this.queues[i].name,
        phone: this.queues[i]['sip'].phoneNumber,
        strategy: this.queues[i]['strategyName'],
        timeout: this.queues[i]['timeout'],
        description: this.queues[i]['description'],
      });
    }
  }

  findById(array: any[], id: number): object {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === id) {return array[i]; }}
    return null;
  }
  clickDeleteIcon(id: number) {
    this.pick = this.findById(this.queues, id);
    this.modal.visible = true;
  }
  setPage(page: number): void {
    this.loading = true;
    this.pageInfo.page = page;
    this.getQueues();
  }

  private getQueues(): void {
    this._service.getQueues(this.pageInfo).then(res => {
      if (res.hasOwnProperty('items')) {
        this.pageInfo.total = res.pageCount;
        this.queues = res.items;
        this.fillData();
        this.loading = false;
      }
    }).catch(err => {
      console.error(err);
      this.loading = false;
    });
  }
}
