import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

import {RingGroupsServices} from '../../../services/ring-groups.service';
import {FadeAnimation} from '../../../shared/fade-animation';


@Component({
  selector: 'ring-groups-create-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class RingGroupsCreateComponent implements OnDestroy {
  constructor(public service: RingGroupsServices,
              private activatedRoute: ActivatedRoute,
              private router: Router) {
    if (this.activatedRoute.snapshot.params.id) {
      this.getRingGroup(this.activatedRoute.snapshot.params.id);
      this.service.editMode = true;
    } else {
      this.service.editMode = false;
    }
    this.service.getParams();
  }

  save(): void {
    this.service.save(this.activatedRoute.snapshot.params.id);
  }

  cancel(): void {
    this.service.cancel();
  }

  back(): void {
    this.router.navigate(['members'], {relativeTo: this.activatedRoute});
  }

  validation(): boolean {
    return !(
      this.service.ringGroups.sipId &&
      this.service.ringGroups.name &&
      (this.service.ringGroups.name.length < 255) &&
      this.service.ringGroups.strategy &&
      this.service.ringGroups.timeout &&
      this.service.ringGroups.maxlen &&
      this.service.ringGroups.queueMembers.length > 0
    );
  }

  private reset() {
    this.service.ringGroups = {
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
    this.service.userView = {
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

  private getRingGroup(id) {
    this.service.getRingGroup(id).then(res => {
      this.service.ringGroups.sipId = res.sip.id;
      this.service.ringGroups.name = res.name;
      this.service.ringGroups.strategy = res.strategy;
      this.service.ringGroups.timeout = res.timeout;
      this.service.ringGroups.announceHoldtime = res.announceHoldtime;
      this.service.ringGroups.announcePosition = res.announcePosition;
      this.service.ringGroups.maxlen = res.maxlen;
      this.service.ringGroups.description = res.description;
      this.service.getParams();
      this.service.userView.phoneNumber = res.sip.phoneNumber;
      this.service.userView.announceHoldtime = res.announceHoldtime !== 0;
      this.setMembers(res.queueMembers);
    }).catch(err => {
      console.error(err);
    });
  }

  private setMembers(members) {
    for (let i = 0; i < members.length; i++) {
      this.service.ringGroups.queueMembers.push({sipId: members[i].sip.id});
      this.service.userView.members.push(members[i].sip);
      this.service.userView.members[i].sipOuterPhone = this.service.userView.phoneNumber;
    }
    console.log(this.service.userView.members);
  }

  ngOnDestroy() {
    this.reset();
  }
}
