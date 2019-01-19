import {Injectable} from '@angular/core';
import {BaseService} from './base.service';
import {PhoneNumberExternalModel} from '../models/phone-number-external.model';

@Injectable()
export class ExternalPhoneNumberService extends BaseService {

    onInit() {
        this.url = 'sip/outers';
    }

}
