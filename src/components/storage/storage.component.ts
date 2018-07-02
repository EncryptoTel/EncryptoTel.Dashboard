import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../services/storage.service";
import {MessageServices} from "../../services/message.services";
import {StorageModel} from "../../models/storage.model";

@Component({
    selector: 'pbx-storage',
    templateUrl: './template.html',
    styleUrls: ['./local.sass'],
    providers: [StorageService]
})

export class StorageComponent implements OnInit {
    constructor(private service: StorageService,
                private message: MessageServices) {

    }
    loading: number = 0;
    pageInfo: StorageModel;

    getList() {
        this.loading += 1;
        this.service.getList().then(res => {
            this.pageInfo = res;
            console.log(this.pageInfo);
            this.loading -= 1;
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

    ngOnInit() {
        this.getList();
    }

}
