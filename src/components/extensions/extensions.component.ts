import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {ExtensionsServices} from '../../services/extensions.services';
import {MainViewComponent} from '../main-view.component';

@Component({
  selector: 'extensions-component',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [ExtensionsServices]
})

export class ExtensionsComponent implements OnInit {

  loading: {
    body: boolean,
    pagination: boolean,
    sidebar: boolean
  };
  department = {
    option: [
      {id: 1, title: 'Sales department'},
      {id: 2, title: 'Account department '},
      {id: 3, title: 'Export sales department'},
      {id: 4, title: 'IT Department'},
      {id: 5, title: 'Research and development'},
      {id: 6, title: 'Unsorted'},
      {id: 7, title: 'All'}],
    selected: null
  };
  pageinfo: {
    page: number,
    limit: number,
    search: string,
    total: number
  };
  sidebar = {
    visible: false,
    select: null,
    data: {
      extension: '123',
      phone: '123-45-67',
      firstname: 'Name',
      lastname: 'Last',
      email: 'www@html.net',
      mobile: '+1(000)123-45-67',
      department: 'Sales'
    }
  };
  table = {
    title: ['#Ext',      'Phone Number', 'First Name', 'Last Name', 'E-mail', 'Mobile', 'Status', 'Default', ''  ],
    key:   ['extension', 'phone',        'firstname',  'lastname',  'email',  'mobile', 'status', 'default'          ],
    width: [true,         false,          false,        false,       false,    false,    true,     true,         true],
    data: []
  };
  text = MainViewComponent.prototype;
  modal = {
    delete_user: {
      visible: false, title: 'Delete user',
      confirm: {type: 'error', value: 'Delete'},
      decline: {type: 'cancel', value: 'Cancel'}
    }
  };

  extension = [];

  exportExt(): void {
    // etc.
  }
  importExt(): void {
    // etc.
  }
  addExt(): void {
    // etc.
  }
  closeExt(): void {
    this.sidebar.select = null;
    this.sidebar.visible = false;
  }
  editExt(id: number): void {
    console.log('Edit user' + id);
    // etc.
  }

  fillTableData(): void {
    this.table.data = [];
    for (let i = 0; i < this.pageinfo.limit && i < this.extension.length; i++) {
      this.table.data.push({
          id: this.extension[i].id,
          extension: this.extension[i].extension,
          phone: this.extension[i].phoneNumber,
          firstname: this.extension[i].firstname,
          lastname: this.extension[i].lastname,
          email: this.extension[i].email,
          mobile: this.extension[i].mobile,
          status: this.extension[i].status,
          default: this.extension[i].default
        }); }
  }

  changePage(page: number): void {
    this.loading.body = true;
    this.pageinfo.page = page;
    this.RemoveMe();
    this.fillTableData();
    this.loading.body = false;
    // etc.
  }

  viewExt(id: number) {
    this.sidebar.select = (this.sidebar.visible = this.sidebar.select !== id) ? id : null;
    // etc.
  }

  sendPasswordToAdmin(id: number): void {
    console.log('send to admin!');
    // etc.
  }

  sendPasswordToUser(id: number): void {
    console.log('send to user!');
    // etc.
  }
  deleteUser(id: number): void {
    console.log('User was deleted!');
    this.sidebar.select = null;
    this.sidebar.visible = false;

  }

  clickDeleteIcon(id: number) {
    console.log(this.sidebar.visible);
    this.sidebar.select = id;
    this.showModal('delete_user');
  }

  clickEditIcon(id: number) {
    this.sidebar.select = id;
  }

  showModal(text: string): void {
    this.modal[text].visible = true;
  }



  ngOnInit(): void {
    this.loading = {body: true, pagination: true, sidebar: true};
    this.pageinfo = {page: 1, search: '', total: 3,
      limit: (window.innerHeight - 296 - (window.innerHeight - 296) % 40) / 40};
    this.RemoveMe();
    this.fillTableData();
    this.department.selected = this.department.option[4];
    this.loading = {body: false, pagination: false, sidebar: false};
  }

  RemoveMe(): void {
    this.extension = [];
    for (let i = (this.pageinfo.page - 1) * this.pageinfo.limit;
         i < this.pageinfo.page * this.pageinfo.limit; i++) {
      this.extension.push({
        id: i + 2,
        firstname: 'firstname #' + i,
        lastname: 'lastname #' + i,
        extension: 'ext #' + i,
        phoneNumber: '+7(952)-10-20-' + i,
        email: i + 'qwe@qwe.qwe',
        mobile: '+7(000)-10-20-' + i,
        status: Math.random() > 0.8 ? 'Enabled' : null,
        default: Math.random() > 0.8,
        department: 'department #' + i}); }
  }
}
