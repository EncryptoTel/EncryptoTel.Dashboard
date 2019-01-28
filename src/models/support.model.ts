import {BaseItemModel, PageInfoModel} from './base.model';

export class SupportModel extends PageInfoModel {
    items: SupportItemModel[];
    messages: MessagesItemModel[];
}

export class SupportItemModel extends BaseItemModel {
    public id: number;
    public subject: string;
    public status: number;
    public supportUserName: string;
    public created: string;
    public updated: string;
    public message: string;

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
        } else {
            this.id =  null;
            this.subject =  null;
            this.status = null;
            this.supportUserName = null;
            this.created = null;
            this.updated = null;
            this.message = null;
        }
    }


}


export class MessagesItemModel extends BaseItemModel {
    public supportTicket: number;
    public message: string;

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