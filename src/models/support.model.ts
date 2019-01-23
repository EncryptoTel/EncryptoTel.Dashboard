import {BaseItemModel, PageInfoModel} from './base.model';

export class SupportModel extends PageInfoModel {
    items: SupportItemModel[];
}

export class SupportItemModel extends BaseItemModel {
    public id: number;
    public subject: string;
    public status: number;
    public support: string;
    public created: string;
    public updated: string;

    constructor(response?) {
        super();
        if (response) {
            this.id = response.id ? response.id : null;
            this.subject = response.subject ? response.subject : null;
            this.status = response.status ? response.status : null;
            this.support = response.support ? response.support : null;
            this.created = response.created ? response.created : null;
            this.updated = response.updated ? response.updated : null;
        } else {
            this.id =  null;
            this.subject =  null;
            this.status = null;
            this.support = null;
            this.created = null;
            this.updated = null;
        }
    }


}
