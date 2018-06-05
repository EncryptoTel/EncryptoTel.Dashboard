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
