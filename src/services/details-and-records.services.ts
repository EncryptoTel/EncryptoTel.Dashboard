import {Injectable} from '@angular/core';
import {RequestServices} from './request.services';

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


  fetchDetailsAndRecords (page: number, limit: number, sort: string, sortDirection: string, tags: any): Promise<any> {
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

  getSound(id) {
    return this.request.get(`v1/account/file/${id}`).then(res => {
      console.log(res);
        const dataURI = 'data:audio/x-mp3;base64,' + res.dataBase64;
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], {type: mimeString});
        return window.URL.createObjectURL(blob);

    }).catch(err => {
      console.error(err);
    });
  }

}
