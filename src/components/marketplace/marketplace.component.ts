import {Component, OnInit} from '@angular/core';
import {Module} from '../../models/module.model';
import {ModuleServices} from '../../services/module.services';

@Component({
  selector: 'pbx-marketplace',
  templateUrl: './template.html',
  styleUrls: ['./local.sass'],
  providers: [ModuleServices]
})

export class MarketplaceComponent implements OnInit {
  modules: Module[];

  constructor(private _services: ModuleServices) {}

  ngOnInit(): void {
    this.modules = [];
    this._services.getModulesList()
      .then(res => {
        res.map(module => {
          this.modules.push({
            id: module.service.id,
            title: module.service.title,
            content: module.service.description,
            price: module.currentPrice.summWithVat,
            status: false, // TODO: required status in backend response
            color: Math.round(Math.random() * 5 + 1) // TODO: required color in backend response
          });
        });
      }).catch();
  }
}


