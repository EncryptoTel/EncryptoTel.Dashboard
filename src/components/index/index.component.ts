import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {MessageServices} from '../../services/message.services';

@Component({
  selector: 'project-index',
  templateUrl: './template.html',
  styles: [`button{width: 100px;margin: auto}`]
})

export class IndexComponent {
  constructor(private router: Router,
              private messages: MessageServices) {}
  logout() {
    localStorage.clear();
    this.messages.writeSuccess('Logout successful');
    return this.router.navigate(['../sign-in']);
  }
}
