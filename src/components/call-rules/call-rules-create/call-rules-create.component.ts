import {Component, OnInit, ViewChild, ViewContainerRef} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';

import {FadeAnimation} from '../../../shared/fade-animation';
import {CallRulesServices} from '../../../services/call-rules.services';
import {SipOuter} from '../../../models/call-rules.model';

@Component({
  selector: 'pbx-call-rules-create',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class CallRulesCreateComponent implements OnInit {
  numbers: SipOuter[];
  selectedNumber: SipOuter;
  callRulesForm: FormArray;
  actionsList = [
    {title: 'Redirect to external number', id: 1},
    {title: 'Redirect to extension number', id: 2},
    {title: 'Redirect to queue', id: 3},
    {title: 'Redirect to ring groups', id: 4},
    {title: 'Play voice file', id: 5},
    {title: 'Terminate call', id: 6},
    {title: 'Leave a Voicemail', id: 7}
  ];
  selectedActions = [];

  @ViewChild('actionContainer', {read: ViewContainerRef}) actionTemplate: ViewContainerRef;
  @ViewChild('redirectToExternalNumberTemplate') redToExtNum;

  constructor(private service: CallRulesServices,
              private fb: FormBuilder) {
  }

  selectAction(action): void {
    this.selectedActions.push(action);
    switch (action.id) {
      case 1:
        this.addAction(this.createRedirectToExternalNumber());
        setTimeout(() => {
          this.actionTemplate.createEmbeddedView(this.redToExtNum);
        }, 0);
        break;
      case 2:
        this.addAction(this.createRedirectToExtensionNumber());
        break;
      case 3:
        this.addAction(this.createRedirectToQueue());
        break;
      case 4:
        this.addAction(this.createRedirectToRingGroup());
        break;
      case 5:
        this.addAction(this.createRedirectToExternalNumber());
        break;
      case 6:
        this.addAction(this.createRedirectToExternalNumber());
        break;
      case 7:
        this.addAction(this.createRedirectToExternalNumber());
        break;
      default:
        break;
    }
    console.log(this.callRulesForm);
  }

  selectNumber(number: SipOuter): void {
    this.selectedNumber = number;
    this.buildForm();
  }

  private addAction(actionGroup: FormGroup): void {
    this.callRulesForm.controls.push(actionGroup);
  }

  private buildForm(): void {
    this.callRulesForm = this.fb.array([]);
  }

  private createRedirectToExternalNumber(): FormGroup {
    return this.fb.group({
      phone: '',
      timeout: 30,
    });
  }

  private createRedirectToExtensionNumber(): FormGroup {
    return this.fb.group({
      phone: '',
      timeout: 30,
    });
  }

  private createRedirectToQueue(): FormGroup {
    return this.fb.group({
      phone: '',
      timeout: 30,
    });
  }

  private createRedirectToRingGroup(): FormGroup {
    return this.fb.group({
      phone: '',
      timeout: 30,
    });
  }

  private getNumbers(): void {
    this.service.getNumbers().then(res => {
      this.numbers = res.items;
    }).catch(err => {
      console.error(err);
    });
  }

  ngOnInit() {
    this.getNumbers();
  }
}
