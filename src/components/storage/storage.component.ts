import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../services/storage.service";
import {MessageServices} from "../../services/message.services";
import {StorageModel} from "../../models/storage.model";
import {map} from 'rxjs/operators';

@Component({
  selector: 'pbx-storage',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [StorageService]
})

/* export class StorageComponent implements OnInit {
    constructor(private service: StorageService,
                private message: MessageServices) {

    }
    zerg: boolean;
    loading: number = 0;
    pageInfo: {
      page: number,
      itemsCount: number,
      pageCount: number,
      limit: number
    };
    source;

    getList() {
        this.loading++;
        this.service.getList().then(res => {
            this.pageInfo.page = res.page;
            this.pageInfo.itemsCount = res.itemsCount;
            this.pageInfo.pageCount = res.pageCount;
            console.log(1);
            console.log(this.pageInfo);
            this.loading--;
        }).catch(res => {

            this.loading -= 1;
        });
    }

    private uploadFile(files) {
        for (let i = 0; i < files.length; i++) {
            if (files[i].type === 'audio/mp3' || files[i].type === 'audio/ogg' || files[i].type === 'audio/wav' || files[i].type === 'audio/mpeg' || files[i].type === 'audio/x-wav') {
                this.loading +=1;
                const formData = new FormData();
                formData.append('account_file_type', 'audio');
                formData.append('account_file', files[i]);
                this.service.uploadFile(formData).then(res => {
                    // this.getStorage(1);
                    console.log(res);
                    this.loading -= 1;
                }).catch(err => {
                    console.log(err);
                    this.loading -= 1;
                });
            } else {
                this.message.writeError('Accepted formats: mp3, ogg, wav');
            }
        }
    }

    dropHandler(e) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        this.uploadFile(files);
        console.log('dropHandler', e);
    }

    dragOverHandler(e) {
        e.preventDefault();
        console.log('dragOverHandler', e);
    }

    dragEndHandler(e) {
        console.log('dragEndHandler', e);
    }

    dragLeaveHandler(e) {
        e.preventDefault();
        console.log('dragLeaveHandler', e);
    }

    setSource(): void {
        this.source = {
            option: [{title: 'Call Records'}, {title: 'Sound Files'}, {title: 'Trash'}],
            select: {title: 'Call Records'}};
    }

  ngOnInit() {
    console.log(3);
    this.zerg = true;
    this.setSource();
    this.getList();
  }
} */

export class StorageComponent implements OnInit {
  constructor(
    private service: StorageService
  ) {}
  loading = 0;
  pageInfo = {
    page: 1,
    itemsCount: 0,
    pageCount: 1,
    limit: 20,
    search: ''
  };
  source = {
    option: [
      {title: 'Call Records', type: 'call_record'},
      {title: 'Audio', type: 'audio'},
      {title: 'Trash', type: 'trash'}],
    select: {title: '', type: ''}
  };
  table = {
    call_record: {
      head: [
        {title: 'From', sort: true, width: null},
        {title: 'To', sort: true, width: null},
        {title: 'Start time', sort: true, width: 168},
        {title: 'Duration', sort: false, width: 88},
        {title: 'Size, Mbyte',sort: false, width: 104},
        {title: 'Record', sort: false, width: 200},
        {title: '', sort: false, width: 48}],
      key: ['from', 'to', 'start', 'duration', 'size'],
      defaultSort: {isDown: true, column: 2}
    },
    audio: {
      head: [
        {title: 'Name', sort: true, width: null},
        {title: 'Duration', sort: true, width: null},
        {title: 'File Format', sort: false, width: 104},
        {title: 'Size, Mbyte',sort: false, width: 104},
        {title: 'Record', sort: false, width: 168},
        {title: '', sort: false, width: 48}],
      key: ['form', 'to', 'start', 'duration', 'size'],
      defaultSort: {isDown: false, column: 0}
    },
    trash: {
      head: [
        {title: 'Name', sort: true, width: null},
        {title: 'Date', sort: true, width: 168},
        {title: 'Size, Mbyte',sort: false, width: 104},
        {title: '', sort: false, width: 48}],
      key: ['name', 'date', 'size'],
      defaultSort: {isDown: true, column: 1}
    },
  };
  sort = {isDown: true, column: 2};
  fake = {
    call_record: [
      {id: 2, from: '+6 (399) 871 20 61 #315', to: '+3 (724) 868 85 34 #779', start: '15/9/2016 50:54:05', duration: 323, size: 8814451, name: 'qwswmmffjfdfpockuaesj', format: 'OGG', date: '7/4/2018', file: null, type: 'call_record'},
      {id: 6, from: '+3 (504) 659 95 46 #838', to: '+9 (742) 874 11 71 #364', start: '2/5/2017 18:25:23', duration: 440, size: 3186145, name: 'zwsksuzvifnfnwgmyokduy', format: 'MP3', date: '22/4/2018', file: null, type: 'call_record'},
      {id: 14, from: '+1 (922) 874 37 38 #545', to: '+4 (395) 854 07 52 #749', start: '21/1/2017 13:14:22', duration: 159, size: 3733413, name: 'dryprtywzag', format: 'OGG', date: '3/12/2018', file: null, type: 'call_record'},
      {id: 15, from: '+7 (298) 002 74 59 #805', to: '+1 (937) 144 79 89 #832', start: '5/6/2016 13:39:17', duration: 693, size: 9852885, name: 'atbteadnp', format: 'MP3', date: '29/10/2016', file: null, type: 'call_record'},
      {id: 17, from: '+4 (938) 207 99 01 #532', to: '+9 (757) 104 49 59 #752', start: '8/7/2016 12:09:32', duration: 279, size: 9625424, name: 'orldidxbxutfxhg', format: 'MP3', date: '20/6/2016', file: null, type: 'call_record'},
      {id: 18, from: '+8 (469) 106 32 55 #514', to: '+1 (685) 130 86 90 #184', start: '1/4/2016 48:14:02', duration: 724, size: 1131650, name: 'vsobclfzyb', format: 'VAW', date: '14/6/2018', file: null, type: 'call_record'},
      {id: 19, from: '+3 (865) 212 42 00 #532', to: '+8 (365) 638 38 22 #553', start: '15/3/2017 32:14:15', duration: 758, size: 3773919, name: 'mfbybopwhcyqqnnmohyfedcy', format: 'VAW', date: '14/6/2018', file: null, type: 'call_record'},
      {id: 21, from: '+4 (793) 289 20 84 #615', to: '+8 (815) 004 95 50 #353', start: '9/11/2016 18:44:07', duration: 767, size: 5328352, name: 'nyaqmw', format: 'OGG', date: '6/8/2016', file: null, type: 'call_record'},
      {id: 32, from: '+4 (767) 115 66 70 #259', to: '+2 (128) 299 02 38 #610', start: '15/11/2017 42:24:21', duration: 171, size: 143193, name: 'jxgyxztftjqy', format: 'OGG', date: '17/10/2017', file: null, type: 'call_record'},
      {id: 33, from: '+2 (118) 551 06 97 #736', to: '+9 (713) 630 57 49 #280', start: '14/4/2017 01:14:40', duration: 551, size: 6778324, name: 'yrryswyuqygo', format: 'VAW', date: '26/6/2017', file: null, type: 'call_record'},
      {id: 34, from: '+8 (276) 989 98 47 #956', to: '+3 (336) 607 15 73 #835', start: '2/6/2018 39:36:47', duration: 11, size: 4831522, name: 'agcqvsahtlnk', format: 'OGG', date: '2/2/2016', file: null, type: 'call_record'},
      {id: 38, from: '+7 (124) 916 73 93 #396', to: '+8 (930) 387 04 98 #304', start: '16/11/2017 02:41:29', duration: 124, size: 10291798, name: 'grjkbhsbdhpwikbxpz', format: 'OGG', date: '28/12/2018', file: null, type: 'call_record'},
      {id: 40, from: '+4 (123) 646 99 90 #991', to: '+1 (850) 289 95 63 #648', start: '3/1/2016 05:06:01', duration: 876, size: 3437891, name: 'cdpjqmdolrsgurjpcuzxzoca', format: 'MP3', date: '5/10/2018', file: null, type: 'call_record'},
      {id: 41, from: '+4 (832) 429 71 53 #450', to: '+1 (178) 748 77 55 #938', start: '8/6/2018 14:39:55', duration: 309, size: 2965748, name: 'smjhrebjrz', format: 'MP3', date: '4/10/2018', file: null, type: 'call_record'},
      {id: 45, from: '+5 (736) 855 77 16 #918', to: '+4 (787) 098 53 93 #885', start: '2/3/2017 49:05:50', duration: 657, size: 1035437, name: 'dviigfraizbbqaberoi', format: 'OGG', date: '14/1/2016', file: null, type: 'call_record'},
      {id: 46, from: '+8 (763) 286 30 32 #271', to: '+3 (443) 699 64 48 #765', start: '11/3/2017 20:21:02', duration: 898, size: 5185314, name: 'hikeapxiuwlsadb', format: 'VAW', date: '20/6/2018', file: null, type: 'call_record'},
      {id: 48, from: '+9 (783) 689 43 07 #704', to: '+2 (978) 038 32 01 #633', start: '20/12/2016 57:25:46', duration: 809, size: 3336808, name: 'njuasvaxzkuymonb', format: 'OGG', date: '24/10/2017', file: null, type: 'call_record'},
      {id: 49, from: '+2 (474) 946 86 09 #396', to: '+1 (872) 384 47 55 #531', start: '17/8/2016 26:48:57', duration: 59, size: 2873345, name: 'zxsesqezzpojmdb', format: 'OGG', date: '20/10/2017', file: null, type: 'call_record'},
      {id: 51, from: '+6 (644) 975 89 07 #226', to: '+8 (491) 644 98 31 #704', start: '18/12/2018 03:02:43', duration: 0, size: 6168139, name: 'xpbgaucbabrhsatacbyaluov', format: 'OGG', date: '28/8/2018', file: null, type: 'call_record'},
      {id: 52, from: '+4 (351) 766 40 72 #682', to: '+8 (393) 121 83 94 #668', start: '5/2/2018 00:06:21', duration: 556, size: 8711469, name: 'zzjjiggdgzvx', format: 'OGG', date: '26/1/2017', file: null, type: 'call_record'},
    ],
    audio: [
      {id: 9, from: '+7 (273) 271 83 14 #208', to: '+3 (740) 018 47 82 #541', start: '2/9/2018 28:23:28', duration: 111, size: 7511204, name: 'qokjxwtayrajfsnajewo', format: 'OGG', date: '13/10/2018', file: null, type: 'sound_file'},
      {id: 16, from: '+7 (358) 098 93 61 #592', to: '+5 (945) 934 63 11 #926', start: '24/10/2017 32:12:07', duration: 396, size: 1313990, name: 'cxbskbkuevebgpexgbmd', format: 'OGG', date: '12/6/2016', file: null, type: 'sound_file'},
      {id: 20, from: '+8 (680) 859 16 70 #641', to: '+4 (859) 457 29 91 #365', start: '28/1/2018 45:57:21', duration: 59, size: 9292349, name: 'bolmfqubgjmfrelmnnoyfse', format: 'OGG', date: '4/10/2016', file: null, type: 'sound_file'},
      {id: 22, from: '+3 (273) 030 92 85 #394', to: '+6 (761) 494 61 06 #312', start: '14/2/2018 07:38:44', duration: 944, size: 6646679, name: 'hgddobnzscwpfggj', format: 'MP3', date: '15/6/2017', file: null, type: 'sound_file'},
      {id: 23, from: '+6 (770) 828 37 82 #400', to: '+1 (201) 234 88 64 #418', start: '12/1/2016 41:02:14', duration: 838, size: 2181889, name: 'tbixqtibvlwgir', format: 'MP3', date: '22/11/2017', file: null, type: 'sound_file'},
      {id: 24, from: '+2 (832) 522 27 21 #562', to: '+2 (209) 436 72 75 #395', start: '14/10/2018 35:55:30', duration: 452, size: 7279698, name: 'pentophfc', format: 'OGG', date: '15/2/2016', file: null, type: 'sound_file'},
      {id: 25, from: '+2 (910) 208 87 19 #762', to: '+9 (406) 514 84 93 #249', start: '15/9/2017 20:17:14', duration: 994, size: 1381429, name: 'hilhcly', format: 'OGG', date: '19/1/2018', file: null, type: 'sound_file'},
      {id: 28, from: '+9 (527) 118 15 17 #887', to: '+2 (628) 251 35 75 #786', start: '12/10/2017 52:49:40', duration: 357, size: 5327321, name: 'wmicqjpjaunk', format: 'MP3', date: '17/1/2018', file: null, type: 'sound_file'},
      {id: 29, from: '+7 (346) 666 46 58 #161', to: '+3 (687) 162 58 92 #360', start: '6/9/2016 06:03:38', duration: 526, size: 3312932, name: 'ikoemkxvmjrm', format: 'MP3', date: '24/8/2017', file: null, type: 'sound_file'},
      {id: 36, from: '+4 (913) 864 30 65 #223', to: '+1 (377) 093 24 53 #803', start: '7/2/2017 41:58:55', duration: 613, size: 2006615, name: 'nddrxadglioiybvmwpz', format: 'OGG', date: '28/8/2017', file: null, type: 'sound_file'},
      {id: 42, from: '+2 (956) 652 10 20 #119', to: '+4 (294) 848 61 70 #177', start: '7/1/2017 47:17:18', duration: 219, size: 9744983, name: 'rubrkrshiuamaandaaey', format: 'OGG', date: '11/5/2018', file: null, type: 'sound_file'},
      {id: 43, from: '+2 (133) 120 59 45 #220', to: '+7 (994) 668 91 85 #559', start: '19/6/2018 56:38:02', duration: 471, size: 4294606, name: 'lcjcniudcqgkpqbd', format: 'MP3', date: '1/3/2017', file: null, type: 'sound_file'},
      {id: 44, from: '+8 (826) 611 39 80 #247', to: '+3 (728) 834 01 43 #818', start: '2/9/2016 56:22:16', duration: 620, size: 4571216, name: 'kizuwdyfnqf', format: 'VAW', date: '6/5/2016', file: null, type: 'sound_file'},
      {id: 55, from: '+4 (652) 955 44 36 #142', to: '+7 (230) 900 04 76 #673', start: '14/3/2017 58:52:30', duration: 330, size: 1543170, name: 'foqermwxolxsks', format: 'MP3', date: '19/8/2018', file: null, type: 'sound_file'},
      {id: 61, from: '+7 (446) 040 19 42 #321', to: '+5 (713) 402 77 16 #958', start: '17/9/2017 28:46:24', duration: 474, size: 7764053, name: 'zaxdjp', format: 'MP3', date: '8/5/2016', file: null, type: 'sound_file'},
      {id: 63, from: '+4 (370) 164 02 48 #717', to: '+7 (651) 684 24 31 #414', start: '21/12/2017 54:40:19', duration: 267, size: 3687065, name: 'vnnaywefddmepy', format: 'MP3', date: '6/8/2016', file: null, type: 'sound_file'},
      {id: 64, from: '+7 (679) 389 30 45 #428', to: '+8 (716) 906 38 62 #261', start: '14/2/2018 37:18:07', duration: 487, size: 2935069, name: 'vrlozfzoe', format: 'OGG', date: '8/6/2018', file: null, type: 'sound_file'},
      {id: 79, from: '+9 (649) 455 20 19 #599', to: '+7 (477) 693 10 03 #529', start: '21/3/2016 46:03:17', duration: 206, size: 8703137, name: 'rznamq', format: 'OGG', date: '14/2/2018', file: null, type: 'sound_file'},
      {id: 81, from: '+1 (909) 385 89 28 #177', to: '+9 (460) 821 39 64 #554', start: '16/6/2017 44:18:38', duration: 193, size: 9422115, name: 'hmurjempvcrmg', format: 'MP3', date: '10/7/2017', file: null, type: 'sound_file'},
      {id: 84, from: '+3 (343) 570 10 29 #428', to: '+7 (745) 576 64 70 #794', start: '7/4/2018 12:59:00', duration: 725, size: 10357254, name: 'yfwpwnymdtcldzuahtvw', format: 'VAW', date: '19/6/2016', file: null, type: 'sound_file'}
    ],
    trash: [
      {id: 3, from: '+9 (784) 321 40 81 #898', to: '+3 (434) 538 54 17 #802', start: '20/3/2016 37:40:37', duration: 342, size: 8555375, name: 'rjoyrtyfrmbskjhmohmz', format: 'VAW', date: '28/8/2018', file: null, type: 'trash'},
      {id: 4, from: '+8 (442) 315 15 58 #420', to: '+1 (415) 467 86 89 #327', start: '29/7/2017 23:13:44', duration: 624, size: 7194832, name: 'mknbwlhil', format: 'MP3', date: '28/6/2018', file: null, type: 'trash'},
      {id: 5, from: '+9 (529) 741 44 05 #305', to: '+8 (757) 392 40 40 #505', start: '16/4/2017 59:26:16', duration: 94, size: 6624581, name: 'cbdonuzjhdh', format: 'MP3', date: '7/5/2017', file: null, type: 'trash'},
      {id: 7, from: '+3 (490) 390 44 83 #349', to: '+9 (442) 321 86 00 #499', start: '14/8/2017 41:22:24', duration: 97, size: 6350688, name: 'rxxepykybhqmrxtlomimxij', format: 'MP3', date: '5/4/2017', file: null, type: 'trash'},
      {id: 8, from: '+6 (611) 401 10 45 #229', to: '+4 (639) 217 17 20 #300', start: '11/6/2017 33:16:32', duration: 897, size: 504381, name: 'yfknblp', format: 'VAW', date: '16/1/2018', file: null, type: 'trash'},
      {id: 10, from: '+2 (603) 977 57 71 #866', to: '+2 (375) 422 27 27 #977', start: '9/12/2016 42:38:10', duration: 492, size: 9082094, name: 'yilsqprqioigprwjfz', format: 'OGG', date: '10/4/2018', file: null, type: 'trash'},
      {id: 11, from: '+7 (288) 876 52 81 #229', to: '+1 (972) 184 93 02 #266', start: '18/11/2017 56:20:12', duration: 843, size: 8987368, name: 'zizoodjyefcey', format: 'OGG', date: '10/5/2017', file: null, type: 'trash'},
      {id: 12, from: '+9 (622) 834 52 24 #887', to: '+2 (789) 683 88 40 #219', start: '27/1/2016 46:02:22', duration: 736, size: 3501628, name: 'eataltbs', format: 'MP3', date: '23/2/2018', file: null, type: 'trash'},
      {id: 13, from: '+8 (430) 269 84 75 #165', to: '+9 (601) 376 16 19 #107', start: '28/12/2016 22:04:50', duration: 489, size: 4786781, name: 'bgtniymwubupjtitoxw', format: 'VAW', date: '29/7/2017', file: null, type: 'trash'},
      {id: 26, from: '+4 (565) 330 84 34 #753', to: '+9 (574) 213 00 49 #847', start: '26/9/2018 18:35:27', duration: 836, size: 2453926, name: 'vskkkkh', format: 'MP3', date: '17/5/2018', file: null, type: 'trash'},
      {id: 27, from: '+5 (132) 707 12 45 #419', to: '+8 (987) 121 79 18 #245', start: '17/11/2018 35:50:12', duration: 814, size: 8732563, name: 'qzkogfe', format: 'MP3', date: '6/5/2017', file: null, type: 'trash'},
      {id: 30, from: '+5 (248) 614 03 47 #925', to: '+5 (503) 740 65 10 #419', start: '2/12/2016 27:31:24', duration: 977, size: 7360765, name: 'fjfvhjhrg', format: 'MP3', date: '19/5/2016', file: null, type: 'trash'},
      {id: 31, from: '+3 (690) 964 49 26 #884', to: '+5 (280) 759 10 81 #413', start: '20/6/2018 19:12:10', duration: 647, size: 377841, name: 'vcjxswphzjfuw', format: 'VAW', date: '7/1/2018', file: null, type: 'trash'},
      {id: 35, from: '+3 (843) 034 45 23 #134', to: '+7 (846) 181 06 98 #238', start: '15/9/2017 42:45:59', duration: 306, size: 2140475, name: 'vnkvwnrlafyi', format: 'VAW', date: '6/11/2016', file: null, type: 'trash'},
      {id: 37, from: '+6 (254) 215 46 99 #629', to: '+5 (918) 781 01 21 #778', start: '12/5/2018 18:13:46', duration: 182, size: 1992892, name: 'lucfqcyrvhvkkhjbdrq', format: 'OGG', date: '1/6/2018', file: null, type: 'trash'},
      {id: 39, from: '+5 (651) 802 24 80 #630', to: '+1 (920) 891 21 71 #348', start: '11/11/2017 58:54:16', duration: 314, size: 2642910, name: 'ebhldrdyaikknazibppscoxr', format: 'VAW', date: '6/6/2018', file: null, type: 'trash'},
      {id: 47, from: '+5 (845) 471 08 74 #574', to: '+3 (107) 386 81 78 #818', start: '7/8/2017 05:17:11', duration: 342, size: 2376190, name: 'qmdriodjjmrmmzmoxieobi', format: 'VAW', date: '26/11/2018', file: null, type: 'trash'},
      {id: 50, from: '+9 (525) 747 82 40 #949', to: '+5 (930) 619 72 01 #993', start: '1/3/2017 06:19:31', duration: 899, size: 4783436, name: 'wvezjovckpwdky', format: 'OGG', date: '18/12/2016', file: null, type: 'trash'},
      {id: 54, from: '+7 (161) 194 27 42 #265', to: '+8 (795) 936 64 81 #299', start: '9/3/2017 10:11:31', duration: 156, size: 2373302, name: 'iaxbvrknwxujukoslplq', format: 'MP3', date: '28/1/2016', file: null, type: 'trash'},
      {id: 59, from: '+4 (763) 257 99 67 #289', to: '+1 (742) 022 13 63 #279', start: '24/7/2017 23:18:18', duration: 882, size: 9419323, name: 'fikjvddtkvqrhblwdfsfitt', format: 'OGG', date: '22/1/2018', file: null, type: 'trash'}
    ]
  };
  data = [];
  player = {item: [], current: null};
  select = [];
  modal = {
    visible: false,
    text: '',
    confirm: {type: 'error', value: 'Delete'},
    decline: {type: 'cancel', value: 'Cancel'}
  };

  selectSource(event) {
    if (event !== this.source.select) {
      this.select = [];
      this.player = {item: [], current: null};
      this.pageInfo.search = '';
      this.source.select = event;
      this.sort = this.table[this.source.select.type].defaultSort;
      this.getList();
    }
  }

  totalSize(): number {
    let sum = 0;
    for (let i = 0; i < this.select.length; i++) {
      sum += this.findById(this.fake[this.source.select.type], this.select[i]).size;
    }
    return sum;
  }

  getList() {
    this.loading++;
    this.service.getList(this.pageInfo, this.source.select.type).then(res => {
      console.log(res.items);
      this.data = res.items;
      this.pageInfo.page = res.page;
      this.pageInfo.itemsCount = res.itemsCount;
      this.pageInfo.pageCount = res.pageCount;
      this.loading--;
    }).catch(res => {
      this.loading--;
    });
  }

  time(value: number): string {
    const sec = (value % 60);
    const min = Math.round(value / 60) % 60;
    const hour = Math.round(value / 3600);
    return (hour<10?'0':'')+hour+':'+(min<10?'0':'')+min+':'+(sec<10?'0':'')+sec;
  }

  size(value: number): string {
    return (value / (1024 * 1024)).toFixed(1);
  }

  setSort(index: number): void {
    if (this.table[this.source.select.type].head[index].sort) {
      this.sort.isDown = !(this.sort.column === index && this.sort.isDown);
      this.sort.column = index;
    }
  }

  selectItem(id: number): void {
    if (this.find(this.select, id)) {
      this.select.splice(this.select.indexOf(id), 1);
    } else {
      this.select.push(id);
    }
  }

  play(id: number): void {
    this.player.current = this.player.current === id ? null : id;
    if (!this.find(this.player.item, id)) {this.player.item.push(id); }
  }

  ngOnInit(): void {
    this.source.select = this.source.option[0];
    this.getList();
  }

  findById(array, id) {
    for (let i = 0; i < array.length; i++) {
      if (array[i].id === id) {return array[i]}
    }
    return null;
  }

  clickDeleteIcon(id: number) {
    this.selectItem(id);
    this.modal.visible = true;
  }

  find(array, value): boolean {
    for (let i = 0; i < array.length; i++) {
      if (array[i] === value) {return true; }
    }
    return false;
  }
}
