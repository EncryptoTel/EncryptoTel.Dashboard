import {Component} from '@angular/core';
import {QueuesListItem} from '../../models/queue.model';
import {CallQueuesServices} from '../../services/call-queues.services';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'pbx-call-queues',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesComponent {
  constructor(private _service: CallQueuesServices,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
    this.getQueues();
  }

  gueues = {
    name: 'test',
    number: '123123',
    strategy: 'Priorized Hunt',
    timeout: '300',
    language: 'English'
  };
  tableInfo = {
    titles: ['Queue Name', 'Phone Number', 'Polling Strategy', 'Timeout', 'Queue Language'],
    keys: ['name', 'number', 'strategy', 'timeout', 'language']
  };
  tableItems = [
    {name: 'test', number: '123123', strategy: 'Priorized Hunt', timeout: 300, language: 'English', id: 1},
    {name: 'test', number: '123123', strategy: 'Priorized Hunt', timeout: 300, language: 'English', id: 2},
    {name: 'test', number: '123123', strategy: 'Priorized Hunt', timeout: 300, language: 'English', id: 3},
    {name: 'test', number: '123123', strategy: 'Priorized Hunt', timeout: 300, language: 'English', id: 4}
  ];

  edit(queue: QueuesListItem) {
    this.router.navigate(['edit', queue.id], {relativeTo: this.activatedRoute});
  }

  delete(id: number) {
    this._service.delete(id).then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }

  private getQueues() {
    this._service.getQueues().then(res => {
      console.log(res);
    }).catch(err => {
      console.error(err);
    });
  }
}
