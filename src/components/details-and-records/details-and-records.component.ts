import {Component} from '@angular/core';
import {FadeAnimation} from '../../shared/fade-animation';


@Component({
  selector: 'pbx-details-and-records',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [FadeAnimation('300ms')]
})

export class DetailsAndRecordsComponent {
  details = [
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'outgoing',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'incoming',
      price: '0',
      record: ''
    },
    {
      from: 'Month payment',
      to: null,
      start_time: null,
      duration: null,
      tag: 'payment',
      price: '99',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'missed',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'record',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'voicemail',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'outgoing',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'incoming',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'missed',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'missed',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'record',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'voicemail',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'record',
      price: '0',
      record: ''
    },
    {
      from: '+1(800)200 01 10 #101',
      to: '+1(800)200 01 10 #108',
      start_time: '26/06/2017 14:47:25',
      duration: '00:23:00',
      tag: 'voicemail',
      price: '0',
      record: ''
    }
  ];
  sorting = 'down';
  activeFilters: string[] = ['outgoing', 'incoming', 'payment', 'missed'];
  inactiveFilters: string[] = ['record', 'voicemail'];

  page = 1;
  max_page = 7;
  tableInfo = {
    titles: ['From', 'To', 'Date', 'Duration', 'Tag', 'Price', 'Record'],
    keys: ['from', 'to', 'start_time', 'duration', 'tag', 'price', 'record']
  };
  getValueByKey(item: any, key: string): string {
    const keyArray = key.split('.');
    keyArray.forEach(k => item = item && item[k]);
    return item;
  }


  toggleFilter(filter: string): void {
    const activeIndex = this.activeFilters.findIndex(el => {
      return el === filter;
    });
    const inactiveIndex = this.inactiveFilters.findIndex(el => {
      return el === filter;
    });
    if (activeIndex >= 0) {
      this.inactiveFilters.unshift(this.activeFilters[activeIndex]);
      this.activeFilters.splice(activeIndex, 1);
    } else if (inactiveIndex >= 0) {
      this.activeFilters.push(this.inactiveFilters[inactiveIndex]);
      this.inactiveFilters.splice(inactiveIndex, 1);
    }
  }

  sort(): void {
    this.sorting = this.sorting === 'down' ? 'up' : 'down';
  }

  setFilters(tag: string): boolean {
    return this.inactiveFilters.includes(tag);
  }
}
