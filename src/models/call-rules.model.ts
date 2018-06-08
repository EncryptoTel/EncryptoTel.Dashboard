export class SipOuter {
  constructor(public id: number,
              public phoneNumber: string) {}
}

export class Action {
  constructor(public id: number,
              public code: string) {}
}

export class SipInner {
  constructor(public id: number,
              public phoneNumber: string) {}
}
