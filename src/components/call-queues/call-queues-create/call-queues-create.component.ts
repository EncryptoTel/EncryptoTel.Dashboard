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
      this.getCallQueue(this.activatedRoute.snapshot.params.id);
      this._service.editMode = true;
    } else {
      this._service.editMode = false;
    }
    this._service.getParams();
  }

  save(): void {
    this._service.save(this.activatedRoute.snapshot.params.id);
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
      announcePosition: 0,
      maxlen: 60,
      description: '',
      queueMembers: []
    };
    this._service.userView = {
      phoneNumber: '',
      announceHoldtime: false,
      announcePosition: false,
      members: [],
      isCurCompMembersAdd: false,
      strategy: {
        code: ''
      }
    };
  }

  private getCallQueue(id) {
    this._service.getCallQueue(id).then(res => {
      this._service.callQueue.sipId = res.sip.id;
      this._service.callQueue.name = res.name;
      this._service.callQueue.strategy = res.strategy;
      this._service.callQueue.timeout = res.timeout;
      this._service.callQueue.announceHoldtime = res.announceHoldtime;
      this._service.callQueue.announcePosition = res.announcePosition;
      this._service.callQueue.maxlen = res.maxlen;
      this._service.callQueue.description = res.description;
      this._service.getParams();
      this._service.userView.phoneNumber = res.sip.phoneNumber;
      this._service.userView.announceHoldtime = res.announceHoldtime !== 0;
      this.setMembers(res.queueMembers);
    }).catch(err => {
      console.error(err);
    });
  }

  private setMembers(members) {
    for (let i = 0; i < members.length; i++) {
      this._service.callQueue.queueMembers.push({sipId: members[i].id});
      this._service.userView.members.push(members[i].sip);
      this._service.userView.members[i].sipOuterPhone = this._service.userView.phoneNumber;
    }
    console.log(this._service.userView.members);
  }
  ngOnDestroy() {
    this.reset();
  }
}
