import {Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
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
  // @ViewChildren('menu') ddMenuWrap: ElementRef;
  @ViewChildren('row') rows: QueryList<'row'>;
  loading = false;

  // details = [
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   },
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   },
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   },
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   },
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   },
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   },
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   },
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   },
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   },
  //   {
  //     source: '+1(800)200 01 10 #101',
  //     destination: '+1(800)200 01 10 #108',
  //     created: '26/06/2017 14:47:25',
  //     duration: '00:23:00',
  //     statusName: 'outgoing',
  //     tag: 'outgoing',
  //     price: '0',
  //     record: '',
  //     ddShow: false,
  //     play: false,
  //     playerOpen: false,
  //     playerContentShow: false,
  //     hover: false
  //   }
  // ];

  details = [];

  sortingActive = 2;
  sorting = [
    {
      active: false,
      direction: 'down'
    },
    {
      active: false,
      direction: 'down'
    },
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
    }
  ];

  activeFilters: string[] = [];
  inactiveFilters: string[] = ['no-answer', 'incoming', 'outgoing', 'missed', 'record'];

  pages: number;
  page = 1;

  limit = Math.floor((window.innerHeight - 280) / 48);

  sort = '';
  sortDirection = '';
  tags = [];

  rowHowerIndex: number;

  contactActionName = 'View contact';
  currentPlayerAction: number;

  dropDirection = 'bottom';

  constructor(
    private services: DetailsAndRecordsServices,
  ) {}

  // dropPosition(): string {
  //
  //   this.rows.forEach((child) => {
  //     console.log(child.nativeElement.offsetTop);
  //   });
  //   // console.log(this.ddMenuWrap);
  //   // console.log(this.ddMenuWrap);
  //   console.log('window.innerHeight', window.innerHeight);
  //   // console.log('nativeElement.offsetTop', this.ddMenuWrap.nativeElement.offsetTop);
  //   // console.log('nativeElement.offsetHeight', this.ddMenuWrap.nativeElement.offsetHeight);
  //   //   if (this.ddMenuWrap.nativeElement) {
  //   //     console.log(this.ddMenuWrap.nativeElement);
  //   // }
  //   // const comparison = (window.innerHeight - this.ddMenuWrap.nativeElement.offsetTop + 22) > 130;
  //   // console.log(comparison);
  //   // return comparison ? 'bottom' : 'top';
  //   return 'top';
  // }


  ngOnInit() {
    this.fetchDetailsAndRecords();
    console.log(window.innerHeight);
    console.log(window.innerHeight - 280);
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

    console.log(this.activeFilters);
    this.tags = [];
    for (let i = 0; i < this.activeFilters.length; i++) {
      switch (this.activeFilters[i]) {
        case 'incoming':
          this.tags.push('incoming');
          break;
        case 'outgoing':
          this.tags.push('outgoing');
          break;
        case 'missed':
          this.tags.push('missed');
          break;
        case 'record':
          this.tags.push('record');
          break;
        case 'no-answer':
          this.tags.push('noAnswered');
          break;
      }
    }
    console.log(this.tags);
    this.fetchDetailsAndRecords();
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
        this.sort = 'date';
        this.fetchDetailsAndRecords();
        break;
      case 3:
        this.sort = 'duration';
        this.fetchDetailsAndRecords();
        break;
      case 4:
        this.sort = 'tag';
        this.fetchDetailsAndRecords();
        break;
      case 5:
        this.sort = 'price';
        this.fetchDetailsAndRecords();
        break;
      case 6:
        this.sort = 'record';
        this.fetchDetailsAndRecords();
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

  dropOpen(event, id) {
    this.details[this.rowHowerIndex].ddShow = this.details[this.rowHowerIndex].ddShow === false;
    // console.log(event.path[3].scrollHeight);
    // console.log(event);
    //
    // console.log(id);

    if ((this.details.length - 4) < id) {
      this.dropDirection = 'top';
    } else {
      this.dropDirection = 'bottom';
    }

    // const comparison = (window.innerHeight - 280 - event.offsetY + 22) > 130;
    // console.log(comparison);
    // return comparison ? 'bottom' : 'top';
  }

  playerAction(index) {
    this.currentPlayerAction = index;
    const detailsLength = this.details.length;

    // old realisation
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


    this.services.getSound(this.details[index].accountFile.id)
      .then(res => {
        console.log(res);
      })
      .catch( err => {
        console.error(err);
      });



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
    if (this.limit < 10) {
      this.limit = 10;
    }
    this.services.fetchDetailsAndRecords(this.page, this.limit, this.sort, this.sortDirection, this.tags)
      .then( res => {
        console.log(res);
        this.loading = false;
        this.details = res.items;
        this.pages = res.pageCount;
        // this.playOld = this.details.length;
        this.details.forEach( (item, i) => {
          // this.details[i].tag = 'incoming';
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
