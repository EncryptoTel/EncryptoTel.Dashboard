export class MessageModel {
  constructor(
    public id: number,
    public type: string,
    public text: string,
    public time: number = 3000
  ) {}
}
