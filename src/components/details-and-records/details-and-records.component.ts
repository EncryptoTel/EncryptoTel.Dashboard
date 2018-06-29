import {Component, OnInit} from '@angular/core';
import {DetailsAndRecordsServices} from '../../services/details-and-records.services';
import {FadeAnimation} from '../../shared/fade-animation';
import {SwipeAnimation} from '../../shared/swipe-animation';


@Component({
  selector: 'pbx-details-and-records',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [
    FadeAnimation('200ms'),
    SwipeAnimation('x', '200ms')
  ]
})

export class DetailsAndRecordsComponent implements OnInit {
  loading = false;

  details = [
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    },
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    },
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    },
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    },
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    },
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    },
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    },
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    },
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    },
    {
      source: '+1(800)200 01 10 #101',
      destination: '+1(800)200 01 10 #108',
      created: '26/06/2017 14:47:25',
      duration: '00:23:00',
      statusName: 'outgoing',
      tag: 'outgoing',
      price: '0',
      record: '',
      ddShow: false,
      play: false,
      playerOpen: false,
      playerContentShow: false,
    }
  ];
  // details = [];

  sortingActive = 0;
  sorting = [
    {
      active: true,
      direction: 'down'
    },
    {
      active: false,
      direction: 'down'
    },
    {
      active: false,
      direction: 'down'
    },
    {
      active: false,
      direction: 'down'
    },
    {
      active: false,
      direction: 'down'
    },
    {
      active: false,
      direction: 'down'
    },
    {
      active: false,
      direction: 'down'
    }
  ];

  activeFilters: string[] = ['incoming', 'outgoing', 'missed', 'record'];
  inactiveFilters: string[] = ['no-answer'];

  pages: number;
  page = 1;

  limit = Math.floor((window.innerHeight - 280) / 48);

  sort = '';
  sortDirection = '';
  filter = '';

  rowHowerIndex: number;

  contactActionName = 'View contact';
  currentPlayerAction: number;

  constructor(
    private services: DetailsAndRecordsServices
  ) {}

  ngOnInit() {
    // this.fetchDetailsAndRecords();
    console.log(window.innerHeight);
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

  setFilters(tag: string): boolean {
    return this.inactiveFilters.includes(tag);
  }

  goToPage(page: number): void {
    console.log(page);
    if (page <= this.pages) {
      if (page > 0) {
        this.page = page;
        this.fetchDetailsAndRecords();
      }
    }
  }

  sortCol(index: number): void {
    this.sortDirection = 'desc';
    if (this.sortingActive === index) {
      this.sorting[index].direction = this.sorting[index].direction === 'down' ? 'up' : 'down';
    } else {
      this.sorting[index].active = true;
      this.sorting[this.sortingActive].direction = 'down';
      this.sorting[this.sortingActive].active = false;
      this.sortingActive = index;
    }
    this.sortDirection = this.sorting[index].direction === 'down' ? 'desc' : 'asc';
    switch (index) {
      case 0:
        this.sort = 'source';
        this.fetchDetailsAndRecords();
        break;
      case 1:
        this.sort = 'destination';
        this.fetchDetailsAndRecords();
        break;
      case 2:
        this.sort = '';
        this.sortDirection = '';
        break;
      case 3:
        this.sort = 'duration';
        this.fetchDetailsAndRecords();
        break;
      case 4:
        this.sort = 'status';
        this.fetchDetailsAndRecords();
        break;
      case 5:
        this.sort = '';
        this.sortDirection = '';
        break;
      case 6:
        this.sort = '';
        this.sortDirection = '';
        break;
    }
  }

  rowHoverStart(index) {
    this.rowHowerIndex = index;
    this.details[index].hover = true;
  }

  rowHoverEnd() {
    this.details.forEach( (item, i) => {
      this.details[i].hover = false;
      this.details[i].ddShow = false;
    });
  }

  dropOpen() {
    this.details[this.rowHowerIndex].ddShow = this.details[this.rowHowerIndex].ddShow === false;
  }

  playerAction(index) {
    this.currentPlayerAction = index;
    const detailsLength = this.details.length;

    // my old realisation
    // for (let i = 0; i < index; i++) {
    //   this.details[i].play = false;
    // }
    // for (let i = index + 1; i < detailsLength; i++) {
    //   this.details[i].play = false;
    // }
    // this.details[index].play = this.details[index].play === false;

    // realisation with syntactic sugar
    for (let i = 0; i < detailsLength; i++) {
      this.details[i].play = (index === i ? !this.details[i].play : false);
    }

    this.details[index].playerOpen = true;

    // if (this.details[index].playerOpen === true && this.details[index].playerContentShow === true) {
    //   this.details[index].playerContentShow = false;
    //   setTimeout( () => {
    //   }, 200);
    // } else if (this.details[index].play === false) {
    //   this.details[index].playerOpen = true;
    // }
  }

  playerAnimationStart() {
  }

  playerAnimationEnd() {
    this.details[this.currentPlayerAction].playerContentShow = this.details[this.currentPlayerAction].playerContentShow === false;
  }

  get paginatorLeftState(): boolean {
    return (this.page <= this.pages && this.page !== 1);
  }

  get paginatorRightState(): boolean {
    return (this.page < this.pages);
  }

  private fetchDetailsAndRecords(): void {
    this.loading = true;
    this.services.fetchDetailsAndRecords(this.page, this.limit, this.sort, this.sortDirection, this.filter)
      .then( res => {
        console.log(res);
        this.loading = false;
        this.details = res.items;
        this.pages = res.pageCount;
        // this.playOld = this.details.length;
        this.details.forEach( (item, i) => {
          this.details[i].tag = 'incoming';
          this.details[i].ddShow = false;
          this.details[i].play = false;
          this.details[i].playerOpen = false;
          this.details[i].playerContentShow = false;
        });
      })
      .catch( err => {
        console.error(err);
        this.loading = false;
      });
  }
}
