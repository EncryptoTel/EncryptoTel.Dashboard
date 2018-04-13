export class QueueModel {
  constructor(
    public sipId: number,
    public name: string,
    public strategy: number,
    public timeout: number,
    public announceHoldtime: number,
    public announcePosition: boolean,
    public maxlen: number,
    public description: string,
    public queueMembers: Members[],
  ) {}
}

class Members {
  constructor(
    public description: string,
    public sipId: number,
  ) {}
}
