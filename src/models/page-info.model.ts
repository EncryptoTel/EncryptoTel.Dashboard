export class PageInfoModel {
    public itemsCount: number;
    public page: number;
    public pageCount: number;
    public limit: number;
    public visible: boolean;
}

export class SortModel {
    public column: string;
    public isDown: boolean;
}