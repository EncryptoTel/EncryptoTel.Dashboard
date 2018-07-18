import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';
import {IfObservable} from 'rxjs/observable/IfObservable';
import {Observable} from 'rxjs/Observable';
import {filter} from 'rxjs/operator/filter';
import {compareValues} from '../shared/shared.functions';

@Injectable()
export class DetailsAndRecordsServices {
  constructor(
    private request: RequestServices
  ) {}

  // getDetailsAndRecords(page: number, limit): Promise<any> {
  //   return this.request.get(`v1/cdr?limit=${limit}&page=${page}`, true);
  // }
  //
  // sortByFrom(dir, limit): Promise<any> {
  //   return this.request.get(`v1/cdr?sort[source]=${dir}&limit=${limit}`, true);
  // }
  //
  // sortByTo(dir, limit): Promise<any> {
  //   return this.request.get(`v1/cdr?sort[destination]=${dir}&limit=${limit}`, true);
  // }
  //
  // sortByStart(dir, limit): Promise<any> {
  //   return this.request.get(`v1/cdr?sort[_______]=${dir}&limit=${limit}`, true);
  // }
  //
  // sortByDuration(dir, limit): Promise<any> {
  //   return this.request.get(`v1/cdr?sort[duration]=${dir}&limit=${limit}`, true);
  // }
  //
  // sortByTag(dir, limit): Promise<any> {
  //   return this.request.get(`v1/cdr?sort[status]=${dir}&limit=${limit}`, true);
  // }
  //
  // sortByPrice(dir, limit): Promise<any> {
  //   return this.request.get(`v1/cdr?sort[_______]=${dir}&limit=${limit}`, true);
  // }
  //
  // sortByRecord(dir, limit): Promise<any> {
  //   return this.request.get(`v1/cdr?sort[_______]=${dir}&limit=${limit}`, true);
  // }


  fetchDetailsAndRecords(page: number, limit: number, sort: string, sortDirection: string, tags: any): Promise<any> {
    const filter = tags.map((i) => {
      return `&filter[status]=${i}`;
    });
    if (sort === '' && sortDirection === '' && filter === []) {
      return this.request.get(`v1/cdr?page=${page}&limit=${limit}`);

    } else if (sort === '' && sortDirection === '') {
      return this.request.get(`v1/cdr?page=${page}&limit=${limit}${filter}`);

    } else if (filter === []) {
      return this.request.get(`v1/cdr?page=${page}&limit=${limit}&sort[${sort}]=${sortDirection}`);

    } else {
      return this.request.get(`v1/cdr?page=${page}&limit=${limit}&sort[${sort}]=${sortDirection}${filter}`);
    }
  }

  mockFetchDetailsAndRecords(page: number, limit: number, sort: string, sortDirection: string, tags: string[]): Promise<any> {
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
      },
      {
        source: '+1(800)200 01 12 #301',
        destination: '+1(800)200 01 13 #308',
        created: '01/07/2017 09:47:25',
        duration: '00:56:00',
        statusName: 'record',
        tag: 'record',
        price: '40',
        record: 'http://edge.flowplayer.org/fake_empire.m3u8',
        ddShow: false,
        play: false,
        playerOpen: false,
        playerContentShow: false,
        hover: false
      },
      {
        source: '+1(800)200 01 13 #401',
        destination: '+1(800)200 01 13 #408',
        created: '01/07/2017 12:47:25',
        duration: '00:12:00',
        statusName: 'missed',
        tag: 'missed',
        price: '0',
        record: 'http://sample.vodobox.net/skate_phantom_flex_4k/skate_phantom_flex_4k.m3u8',
        ddShow: false,
        play: false,
        playerOpen: false,
        playerContentShow: false,
        hover: false
      },
      {
        source: '+1(800)200 01 14 #501',
        destination: '+1(800)200 01 14 #508',
        created: '01/07/2017 11:47:25',
        duration: '00:12:00',
        statusName: 'no-answer',
        tag: 'noAnswered',
        price: '0',
        record: '',
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
  
  getSound(id) {
    return this.request.get(`v1/account/file/${id}`);
  }

}
