import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {Countries, Types} from '../models/address-book.model';

@Injectable()

export class AddressBookServices {
  constructor(private request: RequestServices) {
  }

  block(data: object): Promise<any> {
    return this.request.post(`v1/blacklist`, data, true);
  }

  getContacts(pageInfo: any): Promise<any> {
    return this.request.get(`v1/contact?page=${pageInfo.page}&limit=${pageInfo.limit}`, true);
  }
  getContact(contactId: number): Promise<any> {
    return this.request.get(`v1/contact/${contactId}`, true);
  }

  getCountries(): Promise<Countries> {
    return this.request.get(`v1/countries`, true);
  }

  getTypes(): Promise<Types> {
    return this.request.get(`v1/contact/get-types`, true);
  }

  saveContact(contact): Promise<any> {
    return this.request.post(`v1/contact`, contact, true);
  }

  delete(id: number): Promise<any> {
    return this.request.del(`v1/contact/${id}`, true);
  }

  edit(id: number, contact): Promise<any> {
    return this.request.put(`v1/contact/${id}`, contact, true);
  }

  search(keyword: string): Promise<any> {
    return this.request.get(`v1/contact?search=${keyword}`, true);
  }
}
