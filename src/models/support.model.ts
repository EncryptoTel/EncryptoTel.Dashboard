import {BaseItemModel, PageInfoModel} from './base.model';

export class SupportModel extends PageInfoModel {
    items: SupportItemModel[];
}

export class SupportItemModel extends BaseItemModel {
    public id: number;
    public subject: string;
    public status: number;
    public supportUserName: string;
    public created: string;
    public updated: string;
    public message: string;
    public messages: MessagesItemModel[];

    constructor(response?) {
        super();
        if (response) {
            this.id = response.id ? response.id : null;
            this.subject = response.subject ? response.subject : null;
            this.status = response.status ? response.status : null;
            this.supportUserName = response.supportUserName ? response.supportUserName : null;
            this.created = response.created ? response.created : null;
            this.updated = response.updated ? response.updated : null;
            this.message = response.message ? response.message : null;
            this.messages = response.messages ? response.messages : [];
        } else {
            this.id =  null;
            this.subject =  null;
            this.status = null;
            this.supportUserName = null;
            this.created = null;
            this.updated = null;
            this.message = null;
            this.messages = [];
        }
    }

    get ticketStatusName() {
        if (this.status === 1) {
            return 'New';
        }
        if (this.status === 2) {
            return 'In Progress';
        }
        if (this.status === 3) {
            return 'Completed';
        }
        if (this.status === 4) {
            return 'Reopen';
        }
    }

    get ticketStatusClass() {
        if (this.status === 1) {
            return 'new_ticket';
        }
        if (this.status === 2) {
            return 'in_progress_ticket';
        }
        if (this.status === 3) {
            return 'completed_ticket';
        }
        if (this.status === 4) {
            return 'reopen_ticket';
        }
    }
}


export class MessagesItemModel extends BaseItemModel {
    public id: number;
    public supportTicket: number;
    public message: string;
    public parent: any;
    public supportUserName: string;
    public user: any;

    constructor(response?) {
        super();
        if (response) {
            this.supportTicket = response.id ? response.id : null;
            this.message = response.message ? response.message : null;
        } else {
            this.supportTicket =  null;
            this.message = null;
        }
    }


}