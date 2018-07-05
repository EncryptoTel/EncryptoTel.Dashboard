export class NotificatorModel {
  constructor(
    public visible: boolean,
    public message: string,
    public actionType: string,
    public actionName: string
  ) {}
}
