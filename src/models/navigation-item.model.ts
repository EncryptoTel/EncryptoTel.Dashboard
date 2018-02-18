export class NavigationItemModel {
  constructor(
    public id: number,
    public title: string,
    public link: string,
    public icon: string,
    public status: boolean,
    public visible: boolean
  ) {}
}
