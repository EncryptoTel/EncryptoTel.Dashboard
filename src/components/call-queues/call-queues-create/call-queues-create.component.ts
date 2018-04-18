import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {CallQueuesServices} from '../../../services/call-queues.services';


@Component({
  selector: 'pbx-call-queues-create',
  templateUrl: './template.html',
  styleUrls: ['./local.sass']
})

export class CallQueuesCreateComponent implements OnDestroy {
  constructor(private _service: CallQueuesServices,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
    if (this.activatedRoute.snapshot.params.id) {
      this._service.callQueue.sipId = this.activatedRoute.snapshot.params.id;
    } else {
      console.log('edit mode');
    }
  }

  save(): void {
    this._service.save();
  }

  cancel(): void {
    this._service.cancel();
  }

  back(): void {
    this.router.navigate(['members'], {relativeTo: this.activatedRoute});
  }

  private reset() {
    this._service.callQueue = {
      sipId: 0,
      name: '',
      strategy: 0,
      timeout: 30,
      announceHoldtime: 0,
      announcePosition: false,
      maxlen: 60,
      description: '',
      queueMembers: []
    };
    this._service.userView = {
      phoneNumber: '',
      announceHoldtime: false,
      members: [],
      isCurCompMembersAdd: false,
      strategy: {
        code: ''
      }
    };
  }

  ngOnDestroy() {
    this.reset();
  }
}
