import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {IndexComponent} from '../components/index/index.component';
import {SignInComponent} from '../components/sign-in/sign-in.component';
import {AuthGuardServices} from '../shared/auth-guard.services';

const Routes: Routes = [
  {path: '', redirectTo: 'sign-in', pathMatch: 'full'},
  {path: 'sign-in', component: SignInComponent},
  {path: 'cabinet', component: IndexComponent, canActivate: [AuthGuardServices]},
];

@NgModule({
  imports: [
    RouterModule.forRoot(Routes)
  ],
  exports: [
    RouterModule
  ],
  providers: [
    AuthGuardServices
  ]
})
export class MainRouterModule {  }
