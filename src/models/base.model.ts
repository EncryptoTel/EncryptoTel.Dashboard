export class PageInfoModel {
    public itemsCount: number;
    public page: number;
    public pageCount: number;
    public limit: number;
    public visible: boolean;

    constructor() {
        this.limit = 10;
        this.page = 1;
        // console.log(this.constructor.name);
    }
}

export class SortModel {
    public column: string;
    public isDown: boolean;
}

export class BaseItemModel {
    id: number;
    loading: number;

    constructor() {
        this.loading = 0;
        // console.log(this.constructor.name);
    }
}

export class BaseParam {
    id: number;
    code: string;
}
