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
    public queueMembers: Member[],
  ) {}
}

class Member {
  constructor(
    public sipId: number,
    public description?: string
  ) {}
}

export class QueuesListItem {
  constructor(
    public id: number,
    public name: string,
    public strategy: number,
    public timeout: number,
    public announceHoldtime: number,
    public announcePosition: boolean,
    public maxlen: number,
    public description: string,
  ) {}
}

export class QueuesParams {
  constructor(
    public announceHoldtimes: Param[],
    public strategies: Param[]
  ) {}
}

export class Param {
  constructor(
    public id: number,
    public code: string,
  ) {}
}

export class Members {
  constructor(
    public items: SipInner[]
  ) {}
}

export class SipInner {
  constructor(
    public id: number,
    public phoneNumber: string,
    public status: number,
    public sipOuterPhone?: string
  ) {}
}

export class Departments {
  constructor(
   public items: any[]
  ) {}
}
