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

export class CallRules {
  constructor(public name: string,
              public description: string,
              public sip: object,
              public ruleAction: object,
              public id?: number,
              public statusParameter?: string,
              public status?: number) {}
}
