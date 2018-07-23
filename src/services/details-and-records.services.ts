import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {IfObservable} from 'rxjs/observable/IfObservable';
import {Observable} from 'rxjs/Observable';
import {filter} from 'rxjs/operator/filter';
import {compareValues} from '../shared/shared.functions';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class DetailsAndRecordsServices {
  constructor(
    private request: RequestServices,
    private http: HttpClient
  ) {}

  getDetailsAndRecords(page: number, limit: number, sort: string, sortDirection: string, tags: any): Promise<any> {
    let params = `page=${page}&limit=${limit}`;
    
    if (sort && sortDirection)
      params += `&sort[${sort}]=${sortDirection}`;

    const filter = tags.map((tag) => {
      return `&filter[]=${tag}`;
    });
    if (filter !== [])
      params += filter.join('');

    return this.request.get(`v1/cdr?${params}`);
  }

  mockGetDetailsAndRecords(page: number, limit: number, sort: string, sortDirection: string, tags: string[]): Promise<any> {
    let mockDetails = [
      {
        source: '+1(800)200 01 10 #101',
        destination: '+1(800)200 01 10 #108',
        created: '26/06/2017 14:47:25',
        duration: '00:23:00',
        statusName: 'outgoing',
        tag: 'outgoing',
        price: '10',
        record: 'http://edge.flowplayer.org/fake_empire.m3u8',
        ddShow: false,
        play: false,
        playerOpen: false,
        playerContentShow: false,
        hover: false
      },
      {
        source: '+1(800)200 01 11 #201',
        destination: '+1(800)200 01 11 #208',
        created: '27/06/2017 18:47:25',
        duration: '00:34:00',
        statusName: 'incoming',
        tag: 'incoming',
        price: '33',
        record: 'http://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8',
        ddShow: false,
        play: false,
        playerOpen: false,
        playerContentShow: false,
        hover: false
      }
    ];
    
    let details = (tags.length > 0)
      ? mockDetails.filter(d => tags.indexOf(d.tag) != -1)
      : mockDetails;

    if (sort) {
      details = details.sort(compareValues(sort, sortDirection));
    }

    return Observable.of(details).toPromise().then(data => { return data; });
  }
  
  getRecordMedia(id: number): Promise<any> {
    return this.request.get(`v1/account/file/${id}`);
    // return this.request.get(`v1/account/file/${id}`)
    //   .then(result => {
    //     console.log(result);
    //     return this.http.get(result.fileLink).toPromise()
    //       .then(response => {
    //         console.log(response);
    //         return Promise.resolve(response);
    //       })
    //       .catch((error) => {
    //         console.log(error);
    //         return Promise.reject(error);
    //       });
    //   });
  }
}
