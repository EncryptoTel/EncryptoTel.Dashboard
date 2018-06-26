import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

@Injectable()
export class ExtensionsServices {

  constructor(private _req: RequestServices) {}

  getExtensionsList(requestDetails: any): Promise<any> {
    return this._req.get(`v1/extensions?${encodeURI(requestDetails)}`, true);
  }

}
