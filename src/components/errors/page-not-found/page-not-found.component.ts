import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'error-404',
  template: ``
})

export class PageNotFoundComponent implements OnInit {
  constructor(private _router: Router) {}
  ngOnInit() {
    this._router.navigateByUrl('/');
  }
}
