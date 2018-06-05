import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {Countries, Types} from '../models/address-book.model';

@Injectable()

export class AddressBookServices {
  constructor(private request: RequestServices) {
  }

  getContacts(): Promise<any> {
    return this.request.get(`v1/contacts`, true);
  }

  getCountries(): Promise<Countries> {
    return this.request.get(`v1/countries`, true);
  }

  getTypes(): Promise<Types> {
    return this.request.get(`v1/handbooks/contacts/get-types`, true);
  }

  saveContact(contact): Promise<any> {
    return this.request.post(`v1/contacts`, contact, true);
  }

  delete(id: number): Promise<any> {
    return this.request.del(`v1/contacts/${id}`, true);
  }

  edit(id: number, contact): Promise<any> {
    return this.request.put(`v1/contacts/${id}`, contact, true);
  }
}
