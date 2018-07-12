import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {Countries, Types} from '../models/address-book.model';

@Injectable()

export class AddressBookServices {
  constructor(private request: RequestServices) {
  }

  block(data: object): Promise<any> {
    return this.request.post(`v1/blacklist`, data);
  }

  getContacts(): Promise<any> {
    return this.request.get(`v1/contact`);
  }

  getCountries(): Promise<Countries> {
    return this.request.get(`v1/countries`);
  }

  getTypes(): Promise<Types> {
    return this.request.get(`v1/contact/get-types`);
  }

  saveContact(contact): Promise<any> {
    return this.request.post(`v1/contact`, contact);
  }

  delete(id: number): Promise<any> {
    return this.request.del(`v1/contact/${id}`);
  }

  edit(id: number, contact): Promise<any> {
    return this.request.put(`v1/contact/${id}`, contact);
  }

  search(keyword: string): Promise<any> {
    return this.request.get(`v1/contact?search=${keyword}`);
  }
}
