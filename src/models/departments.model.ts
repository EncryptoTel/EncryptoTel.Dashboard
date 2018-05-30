export class DepartmentsModel {
  constructor(
    public id: number,
    public companyId: number,
    public parentId: number,
    public name: string,
    public numberId: number,
    public employees: number,
    public employeesExt: number,
    public comment: string,
  ) {}
}

export class DepartmentModel {
  constructor(
    public name: string,
    public sip: Sip[],
    public employees?: number,
    public employeesExt?: number,
    public comment?: string,
  ) {}
}

export class Sip {
  constructor(
    public name: string
  ) {}
}

export class SipOuter {
  constructor(
    public id: number,
    public blocked?: boolean
  ) {}
}
