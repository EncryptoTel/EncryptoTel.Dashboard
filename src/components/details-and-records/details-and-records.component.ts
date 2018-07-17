import {Component, OnInit, Pipe, PipeTransform} from '@angular/core';
import {DetailsAndRecordsServices} from '../../services/details-and-records.services';
import {FadeAnimation} from '../../shared/fade-animation';
import {PlayerAnimation} from '../../shared/player-animation';
import {Howl} from 'howler';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'pbx-details-and-records',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  animations: [
    FadeAnimation('200ms'),
    PlayerAnimation
  ]
})

export class DetailsAndRecordsComponent implements OnInit {
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

  dropDirection = 'bottom';



  curID: number;
  player: any;
  payerBlob: any;
  playerId: any;
  playerSeek: any;
  playerFiles = [];
  playerPrevState: any;

  constructor(
    private services: DetailsAndRecordsServices,
  ) {}

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

    if ((this.details.length - 4) < id) {
      this.dropDirection = 'top';
    } else {
      this.dropDirection = 'bottom';
    }
  }

  playerPlayPause(index) {
    this.curID = index;
    const detailsLength = this.details.length;
    console.log(this.details[this.curID]);
    // play only one from array, old realisation
    // for (let i = 0; i < index; i++) {
    //   this.details[i].play = false;
    // }
    // for (let i = index + 1; i < detailsLength; i++) {
    //   this.details[i].play = false;
    // }
    // this.details[index].play = this.details[index].play === false;

    // if (this.player) {
    //   this.player.stop();
    // }

    if (this.details[index].play !== false) {
      if (this.details[index].player) {
        console.log(this.details[index].player.state());
        this.details[index].player.pause();
        this.details[index].playerSeek = this.details[index].player.seek();
        console.log(this.details[index].playerSeek);
      }
    } else {
      this.details[index].playerLoading = true;
      this.services.getSound(this.details[index].accountFile.id).then(res => {
        console.log(res);
        if (res) {
          const self = this;
          this.details[index].playerLoading = false;
          /*
          * Howler init
          * */
          this.details[index].player = new Howl({
            src: [res],
            html5: true,
            onplay: function (id) {
              setInterval(() => {
                console.log(self.details[index].player.seek(id));
                self.details[index].payerProgress = (self.details[index].player.seek(id) * 72) / 100;
              }, 1000);
            }
          });
          /*
          * Howler play
          * */
          this.details[index].player.play();
        }
      });
    }

    // realisation with syntactic sugar
    for (let i = 0; i < detailsLength; i++) {
      this.details[i].play = (index === i ? !this.details[i].play : false);
    }
  }


  playerOpenClose(index) {
    this.curID = index;
    this.details[this.curID].playerAnimationState = this.details[this.curID].playerAnimationState === 'min' ? 'max' : 'min';
  }

  playerAnimationStart() {
    if (this.details[this.curID]) {
      console.log('PLAYER_ANIMATION1', this.details[this.curID].playerAnimationState);
      console.log('PLAYER_ANIMATION2', this.details[this.curID].playerContentShow);
      if (this.details[this.curID].playerAnimationState === 'min') {
        this.details[this.curID].playerContentShow = false;
      }
    }
  }

  playerAnimationEnd() {
    if (this.details[this.curID]) {
      this.details[this.curID].playerContentShow = this.details[this.curID].playerContentShow === false;
      if (this.details[this.curID].playerAnimationState === 'min') {
        this.details[this.curID].playerContentShow = false;
      }
    }
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
          this.details[i].playerAnimationState = 'min';
          this.details[i].playerContentShow = false;
          this.details[i].player = {};
          this.details[i].playerLoading = false;
          // this.details[i].payerState = 'stop';
          this.details[i].payerSeek = '';
          this.details[i].payerProgress = '';
        });
      })
      .catch( err => {
        console.error(err);
        this.loading = false;
      });
  }
}

@Pipe({
  name: 'tp'
})
export class TimePipe implements PipeTransform {

  transform(value: any): string {
    const sec_num = parseInt(value, 10);
    const hours   = Math.floor(sec_num / 3600) % 24;
    const minutes = Math.floor(sec_num / 60) % 60;
    const seconds = sec_num % 60;
    return [hours, minutes, seconds]
      .map(v => v < 10 ? '0' + v : v)
      .filter((v, i) => v !== '00 ' || i > 0)
      .join(':');
  }

}
